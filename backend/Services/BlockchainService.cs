// Services/BlockchainService.cs
using System;
using System.IO;
using System.Linq;
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

            _vkuCoinContractAddress = configuration["Blockchain:VkuCoinAddress"];
            _studentRewardContractAddress = configuration["Blockchain:StudentRewardAddress"];
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

        public async Task<string> CompleteActivity(string studentWalletAddress, int activityId, decimal rewardAmount)
        {
            // We'll skip this method for now as it requires the StudentReward ABI
            // which we don't have hardcoded yet
            throw new NotImplementedException("CompleteActivity is temporarily unavailable");
        }

        public async Task AddStudentRole(string studentWalletAddress)
        {
            var contract = _web3.Eth.GetContract(
                _vkuCoinAbi,
                _vkuCoinContractAddress
            );

            var addStudentFunction = contract.GetFunction("addStudent");

            await addStudentFunction.SendTransactionAsync(
                _adminAccount.Address,
                new HexBigInteger(500000),
                new HexBigInteger(0),
                studentWalletAddress
            );
        }

        public async Task<bool> IsStudent(string walletAddress)
        {
            var contract = _web3.Eth.GetContract(
                _vkuCoinAbi,
                _vkuCoinContractAddress
            );

            var isStudentFunction = contract.GetFunction("isStudent");
            return await isStudentFunction.CallAsync<bool>(walletAddress);
        }

        // We'll keep this method for backward compatibility, but it's not used anymore
        public async Task<string> LoadAbi(string contractName)
        {
            if (contractName == "VkuCoin")
                return _vkuCoinAbi;
                
            throw new NotImplementedException($"ABI for {contractName} is not available");
        }

        public async Task<bool> InitializeAdminWallet()
        {
            try
            {
                // Check connection to blockchain
                var blockNumber = await _web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();
                
                // Set contract addresses for other parts of the application to use
                VkuCoinAddress = _vkuCoinContractAddress;
                StudentRewardAddress = _studentRewardContractAddress;
                
                // Use hardcoded ABI instead of loading from file
                var contract = _web3.Eth.GetContract(
                    _vkuCoinAbi,
                    _vkuCoinContractAddress
                );
                
                // Call a simple method to verify contract access
                var nameFunction = contract.GetFunction("name");
                var tokenName = await nameFunction.CallAsync<string>();
                Console.WriteLine($"Successfully connected to VKUCoin token: {tokenName}");
                
                return !string.IsNullOrEmpty(tokenName);
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
    }
}
