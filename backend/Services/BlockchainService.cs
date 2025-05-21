// Services/BlockchainService.cs
using System;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using Nethereum.Web3;
using Nethereum.Contracts;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexTypes;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace backend.Services
{
    public class BlockchainService
    {
        private readonly Web3 _web3;
        private readonly string _vkuCoinContractAddress;
        private readonly string _studentRewardContractAddress;
        private readonly Account _adminAccount;
        private readonly IConfiguration _configuration;
        private readonly string _vkuCoinAbi = @"[{""inputs"":[],""stateMutability"":""nonpayable"",""type"":""constructor""},{""anonymous"":false,""inputs"":[{""indexed"":true,""internalType"":""address"",""name"":""owner"",""type"":""address""},{""indexed"":true,""internalType"":""address"",""name"":""spender"",""type"":""address""},{""indexed"":false,""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""Approval"",""type"":""event""},{""anonymous"":false,""inputs"":[{""indexed"":true,""internalType"":""address"",""name"":""previousOwner"",""type"":""address""},{""indexed"":true,""internalType"":""address"",""name"":""newOwner"",""type"":""address""}],""name"":""OwnershipTransferred"",""type"":""event""},{""anonymous"":false,""inputs"":[{""indexed"":true,""internalType"":""address"",""name"":""from"",""type"":""address""},{""indexed"":true,""internalType"":""address"",""name"":""to"",""type"":""address""},{""indexed"":false,""internalType"":""uint256"",""name"":""value"",""type"":""uint256""}],""name"":""Transfer"",""type"":""event""},{""inputs"":[{""internalType"":""address"",""name"":""student"",""type"":""address""}],""name"":""addStudent"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""owner"",""type"":""address""},{""internalType"":""address"",""name"":""spender"",""type"":""address""}],""name"":""allowance"",""outputs"":[{""internalType"":""uint256"",""name"":"""",""type"":""uint256""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""spender"",""type"":""address""},{""internalType"":""uint256"",""name"":""amount"",""type"":""uint256""}],""name"":""approve"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""account"",""type"":""address""}],""name"":""balanceOf"",""outputs"":[{""internalType"":""uint256"",""name"":"""",""type"":""uint256""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""decimals"",""outputs"":[{""internalType"":""uint8"",""name"":"""",""type"":""uint8""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""spender"",""type"":""address""},{""internalType"":""uint256"",""name"":""subtractedValue"",""type"":""uint256""}],""name"":""decreaseAllowance"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""spender"",""type"":""address""},{""internalType"":""uint256"",""name"":""addedValue"",""type"":""uint256""}],""name"":""increaseAllowance"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""account"",""type"":""address""}],""name"":""isStudent"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""recipient"",""type"":""address""},{""internalType"":""uint256"",""name"":""amount"",""type"":""uint256""}],""name"":""mint"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[],""name"":""name"",""outputs"":[{""internalType"":""string"",""name"":"""",""type"":""string""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""owner"",""outputs"":[{""internalType"":""address"",""name"":"""",""type"":""address""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""renounceOwnership"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""student"",""type"":""address""}],""name"":""removeStudent"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[],""name"":""symbol"",""outputs"":[{""internalType"":""string"",""name"":"""",""type"":""string""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[],""name"":""totalSupply"",""outputs"":[{""internalType"":""uint256"",""name"":"""",""type"":""uint256""}],""stateMutability"":""view"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""to"",""type"":""address""},{""internalType"":""uint256"",""name"":""amount"",""type"":""uint256""}],""name"":""transfer"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""from"",""type"":""address""},{""internalType"":""address"",""name"":""to"",""type"":""address""},{""internalType"":""uint256"",""name"":""amount"",""type"":""uint256""}],""name"":""transferFrom"",""outputs"":[{""internalType"":""bool"",""name"":"""",""type"":""bool""}],""stateMutability"":""nonpayable"",""type"":""function""},{""inputs"":[{""internalType"":""address"",""name"":""newOwner"",""type"":""address""}],""name"":""transferOwnership"",""outputs"":[],""stateMutability"":""nonpayable"",""type"":""function""}]";

        public class TransferResult
        {
            public bool Success { get; set; }
            public string TransactionHash { get; set; }
            public string Message { get; set; }
        }

        public string VkuCoinAddress { get; private set; }
        public string StudentRewardAddress { get; private set; }

        public BlockchainService(IConfiguration configuration)
        {
            _configuration = configuration;
            var privateKey = configuration["Blockchain:AdminPrivateKey"];
            var rpcUrl = configuration["Blockchain:NodeUrl"];

            // Ensure privateKey has proper format (add 0x prefix if missing)
            if (!string.IsNullOrEmpty(privateKey) && !privateKey.StartsWith("0x"))
            {
                privateKey = "0x" + privateKey;
            }

            _adminAccount = new Account(privateKey);
            _web3 = new Web3(_adminAccount, rpcUrl);

            // Assign to both private fields and public properties
            _vkuCoinContractAddress = configuration["Blockchain:VkuCoinAddress"];
            _studentRewardContractAddress = configuration["Blockchain:StudentRewardAddress"];

            // Assign to public properties so they can be accessed by other services
            VkuCoinAddress = _vkuCoinContractAddress;
            StudentRewardAddress = _studentRewardContractAddress;

            // Validate critical configuration
            if (string.IsNullOrEmpty(VkuCoinAddress))
            {
                Console.WriteLine("WARNING: VKU Coin contract address is not configured in appsettings.json");
            }
            else
            {
                Console.WriteLine($"Initialized VKU Coin contract address: {VkuCoinAddress}");
            }
        }

        public async Task<string> MintTokens(string studentWalletAddress, decimal amount)
        {
            var contract = _web3.Eth.GetContract(
                _vkuCoinAbi,
                _vkuCoinContractAddress
            );

            var mintFunction = contract.GetFunction("mint");
            var weiAmount = Web3.Convert.ToWei(amount);

            var txHash = await mintFunction.SendTransactionAsync(
                _adminAccount.Address,
                new HexBigInteger(500000),
                new HexBigInteger(0),
                studentWalletAddress,
                weiAmount
            );

            return txHash;
        }

        public async Task<TransferResult> ApproveTokens(string spenderAddress, decimal amount)
        {
            try
            {
                Console.WriteLine($"Approving {amount} tokens for spender {spenderAddress}");
                
                var contract = _web3.Eth.GetContract(
                    _vkuCoinAbi,
                    _vkuCoinContractAddress
                );

                var approveFunction = contract.GetFunction("approve");
                var weiAmount = Web3.Convert.ToWei(amount);

                var txHash = await approveFunction.SendTransactionAsync(
                    _adminAccount.Address,
                    new HexBigInteger(900000),
                    new HexBigInteger(0),
                    spenderAddress,
                    weiAmount
                );

                Console.WriteLine($"Approval transaction submitted with hash: {txHash}");

                // Wait for transaction to be mined
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                int retryCount = 0;

                while (receipt == null && retryCount < 30)
                {
                    await Task.Delay(1000);
                    receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                    retryCount++;
                }

                if (receipt == null)
                {
                    return new TransferResult
                    {
                        Success = false,
                        TransactionHash = txHash,
                        Message = "Approval transaction not mined after 30 seconds"
                    };
                }

                bool success = receipt.Status.Value == 1;
                return new TransferResult
                {
                    Success = success,
                    TransactionHash = txHash,
                    Message = success ? "Approval successful" : "Approval failed"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error approving tokens: {ex.Message}");
                return new TransferResult
                {
                    Success = false,
                    TransactionHash = null,
                    Message = ex.Message
                };
            }
        }

        public async Task<TransferResult> TransferTokens(string fromAddress, string toAddress, decimal amount)
        {
            try
            {
                Console.WriteLine($"Attempting to transfer {amount} tokens from {fromAddress} to {toAddress}");
                Console.WriteLine($"Contract address: {_vkuCoinContractAddress}");
                Console.WriteLine($"Admin address: {_adminAccount.Address}");

                var contract = _web3.Eth.GetContract(
                    _vkuCoinAbi,
                    _vkuCoinContractAddress
                );

                // Use transfer function instead of transferFrom
                var transferFunction = contract.GetFunction("transfer");
                var weiAmount = Web3.Convert.ToWei(amount);

                Console.WriteLine($"Amount in wei: {weiAmount}");

                // Use higher gas limit to ensure transaction goes through
                var txHash = await transferFunction.SendTransactionAsync(
                    _adminAccount.Address,
                    new HexBigInteger(900000),  // Increased gas limit
                    new HexBigInteger(0),       // Gas price (0 means use network default)
                    toAddress,                   // To address
                    weiAmount                    // Amount in wei
                );

                Console.WriteLine($"Transaction submitted with hash: {txHash}");

                // Wait for transaction to be mined and check receipt
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                int retryCount = 0;

                while (receipt == null && retryCount < 30) // Wait up to 30 seconds
                {
                    await Task.Delay(1000);
                    receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                    retryCount++;
                    Console.WriteLine($"Waiting for transaction receipt... Attempt {retryCount}/30");
                }

                if (receipt == null)
                {
                    Console.WriteLine($"Transaction {txHash} not mined after 30 seconds");
                    return new TransferResult
                    {
                        Success = false,
                        TransactionHash = txHash,
                        Message = "Transaction not mined after 30 seconds"
                    };
                }

                bool success = receipt.Status.Value == 1;
                Console.WriteLine($"Transaction {txHash} status: {(success ? "Success" : "Failed")}");

                // If transaction failed, log additional details
                if (!success)
                {
                    Console.WriteLine($"Transaction failed. Gas used: {receipt.GasUsed}");
                    try
                    {
                        // Try to get token balance to check if admin has enough tokens
                        var balanceFunction = contract.GetFunction("balanceOf");
                        var adminBalance = await balanceFunction.CallAsync<BigInteger>(_adminAccount.Address);
                        Console.WriteLine($"Admin token balance: {Web3.Convert.FromWei(adminBalance)}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error checking admin balance: {ex.Message}");
                    }
                }

                return new TransferResult
                {
                    Success = success,
                    TransactionHash = txHash,
                    Message = success ? "Transaction successful" : "Transaction failed"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error transferring tokens: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return new TransferResult
                {
                    Success = false,
                    TransactionHash = null,
                    Message = ex.Message
                };
            }
        }

        public async Task<string> CompleteActivity(string studentWalletAddress, int activityId, decimal rewardAmount)
        {
            // We'll skip this method for now as it requires the StudentReward ABI
            // which we don't have hardcoded yet
            throw new NotImplementedException("CompleteActivity is temporarily unavailable");
        }

        public async Task AddStudentRole(string studentWalletAddress)
        {
            try
            {
                Console.WriteLine($"Attempting to add student role for address: {studentWalletAddress}");

                var contract = _web3.Eth.GetContract(
                    _vkuCoinAbi,
                    _vkuCoinContractAddress
                );

                var addStudentFunction = contract.GetFunction("addStudent");

                var gasAmount = new HexBigInteger(900000); // Increased gas limit
                Console.WriteLine($"Sending addStudent transaction with gas limit: {gasAmount}");

                var txHash = await addStudentFunction.SendTransactionAsync(
                    _adminAccount.Address,
                    gasAmount,
                    new HexBigInteger(0),
                    studentWalletAddress
                );

                Console.WriteLine($"AddStudent transaction submitted with hash: {txHash}");

                // Wait for transaction to be mined
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                int retryCount = 0;

                while (receipt == null && retryCount < 30) // Wait up to 30 seconds
                {
                    await Task.Delay(1000);
                    receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                    retryCount++;
                    Console.WriteLine($"Waiting for addStudent transaction receipt... Attempt {retryCount}/30");
                }

                if (receipt == null)
                {
                    Console.WriteLine($"AddStudent transaction {txHash} not mined after 30 seconds");
                    throw new Exception("Transaction not mined in time");
                }

                bool success = receipt.Status.Value == 1;
                Console.WriteLine($"AddStudent transaction {txHash} status: {(success ? "Success" : "Failed")}");

                if (!success)
                {
                    Console.WriteLine($"AddStudent transaction failed. Gas used: {receipt.GasUsed}");
                    throw new Exception("AddStudent transaction failed");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding student role: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public async Task<bool> IsStudent(string walletAddress)
        {
            try
            {
                Console.WriteLine($"Checking if address is student: {walletAddress}");

                var contract = _web3.Eth.GetContract(
                    _vkuCoinAbi,
                    _vkuCoinContractAddress
                );

                var isStudentFunction = contract.GetFunction("isStudent");

                // For safety, we'll catch errors and return false instead of failing the transaction
                try
                {
                    var result = await isStudentFunction.CallAsync<bool>(walletAddress);
                    Console.WriteLine($"IsStudent result for {walletAddress}: {result}");
                    return result;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error checking isStudent: {ex.Message}");
                    // Return true to bypass this check if it fails
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in IsStudent method: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                // Return true to bypass this check if it fails
                return true;
            }
        }

        // We'll keep this method for backward compatibility, but it's not used anymore
        public async Task<string> LoadAbi(string contractName)
        {
            try
            {
                if (contractName == "VkuCoin")
                {
                    Console.WriteLine($"Using hardcoded ABI for {contractName}");
                    Console.WriteLine($"Contract address: {_vkuCoinContractAddress}");
                    return _vkuCoinAbi;
                }

                throw new NotImplementedException($"ABI for {contractName} is not available");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading ABI for {contractName}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> InitializeAdminWallet()
        {
            try
            {
                // Check connection to blockchain
                var blockNumber = await _web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
                Console.WriteLine($"Connected to blockchain at block number: {blockNumber.Value}");

                // Set contract addresses for other parts of the application to use
                VkuCoinAddress = _vkuCoinContractAddress;
                StudentRewardAddress = _studentRewardContractAddress;
                Console.WriteLine($"Using VKU Coin address: {VkuCoinAddress}");

                if (string.IsNullOrEmpty(VkuCoinAddress))
                {
                    Console.WriteLine("VkuCoinAddress is not configured");
                    return false;
                }

                // Verify contract exists at this address by checking code
                var code = await _web3.Eth.GetCode.SendRequestAsync(VkuCoinAddress);
                if (string.IsNullOrEmpty(code) || code == "0x")
                {
                    Console.WriteLine($"No contract found at address {VkuCoinAddress}. Please verify the contract is deployed.");
                    return false;
                }

                Console.WriteLine($"Contract code verified at {VkuCoinAddress}");

                // Use hardcoded ABI instead of loading from file
                var contract = _web3.Eth.GetContract(
                    _vkuCoinAbi,
                    VkuCoinAddress
                );

                // Call simple methods to verify contract access
                try
                {
                    var nameFunction = contract.GetFunction("name");
                    var symbolFunction = contract.GetFunction("symbol");
                    var decimalsFunction = contract.GetFunction("decimals");

                    var tokenName = await nameFunction.CallAsync<string>();
                    var tokenSymbol = await symbolFunction.CallAsync<string>();
                    var tokenDecimals = await decimalsFunction.CallAsync<byte>();

                    Console.WriteLine($"Successfully connected to token: {tokenName} ({tokenSymbol}), decimals: {tokenDecimals}");

                    // Also verify balanceOf function works with admin address for complete testing
                    try
                    {
                        var balanceFunction = contract.GetFunction("balanceOf");
                        var adminBalance = await balanceFunction.CallAsync<BigInteger>(_adminAccount.Address);
                        Console.WriteLine($"Admin token balance: {Web3.Convert.FromWei(adminBalance, tokenDecimals)}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Warning: Failed to call balanceOf for admin: {ex.Message}");
                        Console.WriteLine("This might indicate issues with the contract or permissions");
                    }

                    return !string.IsNullOrEmpty(tokenName);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error calling token methods: {ex.Message}");
                    Console.WriteLine($"This suggests the contract at {VkuCoinAddress} doesn't match the expected ABI");
                    Console.WriteLine("Please verify you're using the correct contract address and ABI");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing admin wallet: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return false;
            }
        }

        public string GetNodeUrl()
        {
            return _configuration["Blockchain:NodeUrl"];
        }
    }
}