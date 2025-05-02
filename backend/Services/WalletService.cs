using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using backend.Models;
using Nethereum.Hex.HexConvertors.Extensions;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace backend.Services
{
    public class WalletService
    {
        private readonly IWeb3 _web3;
        private readonly ILogger<WalletService> _logger;
        private readonly ApplicationDbContext _context;

        public WalletService(IConfiguration configuration, ILogger<WalletService> logger, ApplicationDbContext context)
        {
            var blockchainUrl = configuration["Blockchain:Url"];
            _web3 = new Web3(blockchainUrl);
            _logger = logger;
            _context = context;
        }

        public async Task<Wallet> CreateWalletWithZeroBalance(string userId)
        {
            try
            {
                // Kiểm tra userId hợp lệ
                if (string.IsNullOrEmpty(userId))
                {
                    throw new ArgumentException("UserId không hợp lệ.");
                }

                // Kiểm tra ví đã tồn tại
                var existingWallet = await _context.Wallets.AsNoTracking().FirstOrDefaultAsync(w => w.UserId == userId);
                if (existingWallet != null)
                {
                    _logger.LogInformation($"Wallet already exists for user {userId}.");
                    return existingWallet;
                }

                // Tạo khóa cá nhân và tài khoản mới
                var ecKey = Nethereum.Signer.EthECKey.GenerateKey();
                var privateKey = ecKey.GetPrivateKeyAsBytes().ToHex();
                var account = new Account(privateKey);

                // Tạo đối tượng ví
                var wallet = new Wallet
                {
                    Address = account.Address,
                    PrivateKey = privateKey,
                    Balance = 0, // Số dư ban đầu
                    UserId = userId
                };

                // Thêm ví vào cơ sở dữ liệu
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
                // Tìm ví của người dùng
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

                if (wallet == null)
                {
                    return new TransactionResult(false, "Không tìm thấy ví");
                }

                // Cộng thêm số coin mới vào số dư hiện tại
                wallet.Balance += coinAmount;

                _context.Wallets.Update(wallet);

                // Ghi log giao dịch
                _context.TransactionLogs.Add(new TransactionLog
                {
                    UserId = userId,
                    Amount = coinAmount,
                    TransactionType = "ActivityReward",
                    Description = $"Nhận coin từ hoạt động {activityName}",
                    CreatedAt = DateTime.UtcNow
                });

                // Lưu thay đổi vào cơ sở dữ liệu
                await _context.SaveChangesAsync();

                return new TransactionResult(true, "Cộng coin thành công", wallet.Balance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding coin to wallet for user {userId}");
                return new TransactionResult(false, "Lỗi hệ thống khi cộng coin");
            }
        }

        public async Task<decimal> SyncWalletBalance(string address)
        {
            try
            {
                var balance = await _web3.Eth.GetBalance.SendRequestAsync(address);
                var balanceInEther = Web3.Convert.FromWei(balance.Value);

                // Cập nhật cơ sở dữ liệu
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Address == address);
                if (wallet != null)
                {
                    wallet.Balance = balanceInEther;
                    await _context.SaveChangesAsync();
                }

                return balanceInEther;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing balance for wallet {address}");
                throw;
            }
        }

        public class TransactionResult
        {
            public bool Success { get; }
            public string Message { get; }
            public decimal? NewBalance { get; }

            public TransactionResult(bool success, string message, decimal? newBalance = null)
            {
                Success = success;
                Message = message;
                NewBalance = newBalance;
            }
        }
    }
}
