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

        public string VkuCoinAddress { get; private set; }
        public string StudentRewardAddress { get; private set; }

        public BlockchainService(IConfiguration configuration)
        {
            _configuration = configuration;
            var privateKey = configuration["Blockchain:AdminPrivateKey"];
            var rpcUrl = configuration["Blockchain:NodeUrl"];

            _adminAccount = new Account(privateKey);
            _web3 = new Web3(_adminAccount, rpcUrl);

            _vkuCoinContractAddress = configuration["Blockchain:VkuCoinAddress"];
            _studentRewardContractAddress = configuration["Blockchain:StudentRewardAddress"];
        }

        public async Task<string> MintTokens(string studentWalletAddress, decimal amount)
        {
            // Load ABI from file
            var vkuCoinAbi = await LoadAbi("VkuCoin");

            var contract = _web3.Eth.GetContract(
                vkuCoinAbi,
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
            // Load ABI from file
            var studentRewardAbi = await LoadAbi("StudentReward");

            var contract = _web3.Eth.GetContract(
                studentRewardAbi,
                _studentRewardContractAddress
            );

            var completeActivityFunction = contract.GetFunction("completeActivity");

            var txHash = await completeActivityFunction.SendTransactionAsync(
                _adminAccount.Address,
                new HexBigInteger(500000),
                new HexBigInteger(0),
                studentWalletAddress,
                activityId
            );

            // Sau khi ghi nhận hoạt động, mint token cho sinh viên
            await MintTokens(studentWalletAddress, rewardAmount);

            return txHash;
        }

        public async Task AddStudentRole(string studentWalletAddress)
        {
            var vkuCoinAbi = await LoadAbi("VkuCoin");
            var contract = _web3.Eth.GetContract(
                vkuCoinAbi,
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
            var vkuCoinAbi = await LoadAbi("VkuCoin");
            var contract = _web3.Eth.GetContract(
                vkuCoinAbi,
                _vkuCoinContractAddress
            );

            var isStudentFunction = contract.GetFunction("isStudent");
            return await isStudentFunction.CallAsync<bool>(walletAddress);
        }

        // Sửa phương thức LoadAbi để kiểm tra file trực tiếp
        public async Task<string> LoadAbi(string contractName)
        {
            // Đường dẫn đến thư mục artifacts từ appsettings.json
            var abiBasePath = _configuration["Blockchain:AbiPath"];
            var abiPath = Path.Combine(abiBasePath, $"{contractName}.sol", $"{contractName}.json");

            // Kiểm tra nếu file tồn tại
            if (!File.Exists(abiPath))
            {
                throw new FileNotFoundException($"Không tìm thấy ABI file cho hợp đồng {contractName} tại {abiPath}");
            }

            // Đọc nội dung file ABI
            var jsonContent = await File.ReadAllTextAsync(abiPath);
            var jsonObject = JsonConvert.DeserializeObject<dynamic>(jsonContent);

            return jsonObject.abi.ToString();
        }
    }
}
