using System;
using System.Threading.Tasks;
using System.Numerics;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexConvertors.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using backend.Models;
using backend.Data;

namespace backend.Services
{
    public class WalletService
    {
        private readonly IWeb3 _web3;
        private readonly ILogger<WalletService> _logger;
        private readonly ApplicationDbContext _context;
        private readonly BlockchainService _blockchainService;

        public WalletService(
            IConfiguration configuration,
            ILogger<WalletService> logger,
            ApplicationDbContext context,
            BlockchainService blockchainService)
        {
            var blockchainUrl = configuration["Blockchain:NodeUrl"];
            _web3 = new Web3(blockchainUrl);
            _logger = logger;
            _context = context;
            _blockchainService = blockchainService;
        }

        public async Task<Wallet> CreateWalletWithZeroBalance(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    throw new ArgumentException("UserId không hợp lệ.");

                var existingWallet = await _context.Wallets
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.UserId == userId);

                if (existingWallet != null)
                {
                    _logger.LogInformation($"Wallet already exists for user {userId}.");
                    return existingWallet;
                }

                var ecKey = Nethereum.Signer.EthECKey.GenerateKey();
                var privateKey = ecKey.GetPrivateKeyAsBytes().ToHex();
                var account = new Account(privateKey);

                var wallet = new Wallet
                {
                    Address = account.Address,
                    PrivateKey = privateKey,
                    Balance = 0,
                    UserId = userId
                };

                await _context.Wallets.AddAsync(wallet);
                await _context.SaveChangesAsync();

                return wallet;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating wallet for user {userId}");
                throw;
            }
        }

        public async Task<decimal> GetWalletBalance(string address)
        {
            try
            {
                var balance = await _web3.Eth.GetBalance.SendRequestAsync(address);
                return Web3.Convert.FromWei(balance.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting balance for wallet {address}");
                throw;
            }
        }

        public async Task<TransactionResult> AddCoinToWallet(string userId, int coinAmount, string activityName)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user?.Wallet == null)
                    return new TransactionResult(false, "Không tìm thấy ví");

                if (string.IsNullOrEmpty(user.Wallet.Address))
                    return new TransactionResult(false, "Người dùng chưa đăng ký địa chỉ ví");

                // Thêm STUDENT_ROLE nếu cần
                if (!await _blockchainService.IsStudent(user.Wallet.Address))
                    await _blockchainService.AddStudentRole(user.Wallet.Address);

                // Mint token trên blockchain
                var txHash = await _blockchainService.MintTokens(
                    user.Wallet.Address,
                    coinAmount
                );

                // Cập nhật database
                user.Wallet.Balance += coinAmount;

                _context.TransactionLogs.Add(new TransactionLog
                {
                    UserId = userId,
                    Amount = coinAmount,
                    TransactionType = "ActivityReward",
                    Description = $"Nhận coin từ hoạt động {activityName}",
                    // TransactionHash = txHash,
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                // Đồng bộ số dư từ blockchain
                var syncedBalance = await SyncWalletBalance(user.Wallet.Address);

                return new TransactionResult(
                    true,
                    $"Cộng coin thành công. Transaction hash: {txHash}",
                    syncedBalance,
                    txHash
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding coin to wallet for user {userId}");
                return new TransactionResult(false, $"Lỗi hệ thống khi cộng coin: {ex.Message}");
            }
        }

        public async Task<decimal> SyncWalletBalance(string address)
        {
            try
            {
                // Use the BlockchainService to get the contract details
                var contract = _web3.Eth.GetContract(
                    await _blockchainService.LoadAbi("VkuCoin"),
                    _blockchainService.VkuCoinAddress
                );

                // Fetch the balance using the balanceOf function
                var balance = await contract.GetFunction("balanceOf")
                    .CallAsync<BigInteger>(address);

                var balanceInToken = Web3.Convert.FromWei(balance);
                
                _logger.LogInformation($"Retrieved balance for {address}: {balanceInToken}");

                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.Address == address);

                if (wallet != null)
                {
                    wallet.Balance = balanceInToken;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Updated wallet balance in database: {balanceInToken}");
                }

                return balanceInToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing balance for wallet {address}");

                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.Address == address);

                return wallet?.Balance ?? 0;
            }
        }

        public class TransactionResult
        {
            public bool Success { get; }
            public string Message { get; }
            public decimal? NewBalance { get; }
            public string TransactionHash { get; }

            public TransactionResult(
                bool success,
                string message,
                decimal? newBalance = null,
                string transactionHash = null)
            {
                Success = success;
                Message = message;
                NewBalance = newBalance;
                TransactionHash = transactionHash;
            }
        }
    }
}