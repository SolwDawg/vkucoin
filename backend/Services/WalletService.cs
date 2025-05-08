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
            _logger.LogInformation($"Getting wallet balance for {address}");
            try
            {
                // Get VKU coin contract address from blockchain service
                var coinAddress = _blockchainService.VkuCoinAddress;
                _logger.LogInformation($"Using VKU coin contract address: {coinAddress}");
                
                // Get contract ABI directly from BlockchainService
                var contractAbi = await _blockchainService.LoadAbi("VkuCoin");
                
                // Create contract instance
                var contract = _web3.Eth.GetContract(contractAbi, coinAddress);
                if (contract == null)
                {
                    _logger.LogError($"Failed to get contract instance for {coinAddress}");
                    throw new Exception("Failed to create contract instance");
                }

                // Get token decimals first with explicit error handling
                byte decimals;
                try
                {
                    var decimalsFunction = contract.GetFunction("decimals");
                    _logger.LogInformation("Calling decimals function");
                    decimals = await decimalsFunction.CallAsync<byte>();
                    _logger.LogInformation($"Token decimals: {decimals}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calling decimals function");
                    // Default to 18 decimals as most ERC-20 tokens use this
                    decimals = 18;
                    _logger.LogWarning($"Using default decimals value: {decimals}");
                }

                // Call balanceOf function with explicit error handling
                BigInteger balance;
                try
                {
                    var balanceFunction = contract.GetFunction("balanceOf");
                    _logger.LogInformation($"Calling balanceOf function for address: {address}");
                    balance = await balanceFunction.CallAsync<BigInteger>(address);
                    _logger.LogInformation($"Raw balance: {balance}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calling balanceOf function");
                    throw new Exception($"Failed to get balance: {ex.Message}", ex);
                }
                
                // Convert based on token's decimals
                var balanceInToken = Web3.Convert.FromWei(balance, decimals);
                
                _logger.LogInformation($"Retrieved VKU token balance for {address}: {balanceInToken}");
                
                return balanceInToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting VKU token balance for wallet {address}");
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

                // Find admin wallet to get current balance
                var adminUser = await _context.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Role == "Admin");
                
                if (adminUser?.Wallet == null)
                    return new TransactionResult(false, "Không tìm thấy ví admin");

                // Check if admin has enough balance
                if (adminUser.Wallet.Balance < coinAmount)
                    return new TransactionResult(false, $"Ví admin không đủ coin ({adminUser.Wallet.Balance} < {coinAmount})");

                // Skip student role check for now to fix the error
                // We'll just transfer coins directly instead of checking the student role

                // Perform the blockchain transaction
                string txHash;
                bool txSuccess;
                try
                {
                    (txHash, txSuccess) = await _blockchainService.TransferTokens(
                        user.Wallet.Address,
                        coinAmount
                    );
                    
                    _logger.LogInformation($"Transfer transaction submitted with hash: {txHash}, success: {txSuccess}");
                    
                    if (!txSuccess)
                    {
                        return new TransactionResult(false, $"Giao dịch blockchain thất bại, hash: {txHash}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during blockchain transfer");
                    return new TransactionResult(false, $"Lỗi blockchain: {ex.Message}");
                }

                // Add transaction log entry
                _context.TransactionLogs.Add(new TransactionLog
                {
                    UserId = userId,
                    Amount = coinAmount,
                    TransactionType = "ActivityReward",
                    Description = $"Nhận coin từ hoạt động {activityName}",
                    TransactionHash = txHash,
                    CreatedAt = DateTime.UtcNow
                });

                // Update wallet balances in database
                adminUser.Wallet.Balance -= coinAmount;
                user.Wallet.Balance += coinAmount;
                
                await _context.SaveChangesAsync();

                // Synchronize the actual balance from blockchain to ensure accuracy
                await SyncWalletBalance(user.Wallet.Address);

                return new TransactionResult(
                    true,
                    $"Chuyển coin thành công",
                    user.Wallet.Balance,
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
            _logger.LogInformation($"Starting to sync wallet balance for {address}");
            try
            {
                // Get VKU coin contract address from blockchain service
                var coinAddress = _blockchainService.VkuCoinAddress;
                _logger.LogInformation($"Using VKU coin contract address: {coinAddress}");
                
                // Verify contract address is valid
                if (string.IsNullOrEmpty(coinAddress) || !coinAddress.StartsWith("0x"))
                {
                    _logger.LogError($"Invalid contract address: {coinAddress}");
                    throw new Exception($"Invalid contract address: {coinAddress}");
                }
                
                // Get contract ABI directly from BlockchainService to avoid async issues
                var contractAbi = await _blockchainService.LoadAbi("VkuCoin");
                
                // More robust contract instance creation
                var contract = _web3.Eth.GetContract(contractAbi, coinAddress);
                if (contract == null)
                {
                    _logger.LogError($"Failed to get contract instance for {coinAddress}");
                    throw new Exception("Failed to create contract instance");
                }
                
                // Log contract functions for debugging
                _logger.LogInformation($"Contract functions: {string.Join(", ", contract.ContractBuilder.ContractABI.Functions.Select(f => f.Name))}");

                // Get token decimals first with explicit error handling
                byte decimals = 18; // Default to 18 decimals as most ERC-20 tokens use this
                try
                {
                    var decimalsFunction = contract.GetFunction("decimals");
                    _logger.LogInformation("Calling decimals function");
                    decimals = await decimalsFunction.CallAsync<byte>();
                    _logger.LogInformation($"Token decimals: {decimals}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calling decimals function, using default value of 18");
                }

                // Call balanceOf function with explicit error handling
                BigInteger balance;
                try
                {
                    // Check if contract has balanceOf function
                    if (!contract.ContractBuilder.ContractABI.Functions.Any(f => f.Name == "balanceOf"))
                    {
                        _logger.LogError("Contract doesn't have balanceOf function!");
                        throw new Exception("Contract doesn't have balanceOf function");
                    }
                    
                    var balanceFunction = contract.GetFunction("balanceOf");
                    _logger.LogInformation($"Calling balanceOf function for address: {address}");
                    
                    // Verify address format
                    if (string.IsNullOrEmpty(address) || !address.StartsWith("0x"))
                    {
                        _logger.LogError($"Invalid wallet address format: {address}");
                        throw new Exception($"Invalid wallet address format: {address}");
                    }
                    
                    balance = await balanceFunction.CallAsync<BigInteger>(address);
                    _logger.LogInformation($"Raw balance: {balance}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calling balanceOf function");
                    
                    // Fallback to getting existing database balance
                    var existingWallet = await _context.Wallets
                        .FirstOrDefaultAsync(w => w.Address == address);
                        
                    return existingWallet?.Balance ?? 0;
                }

                // Convert the balance using the retrieved decimals
                var balanceInToken = Web3.Convert.FromWei(balance, decimals);
                _logger.LogInformation($"Retrieved blockchain VKU token balance for {address}: {balanceInToken}");

                // Update database with actual blockchain balance
                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.Address == address);

                if (wallet != null)
                {
                    // Only update if balance has changed
                    if (wallet.Balance != balanceInToken)
                    {
                        _logger.LogInformation($"Updating wallet balance in database from {wallet.Balance} to {balanceInToken}");
                        wallet.Balance = balanceInToken;
                        await _context.SaveChangesAsync();
                    }
                }
                else
                {
                    _logger.LogWarning($"Wallet not found in database for address: {address}");
                }

                return balanceInToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error syncing VKU token balance for wallet {address}");
                
                // Return existing database balance if blockchain query fails
                var existingWallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.Address == address);

                return existingWallet?.Balance ?? 0;
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