using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/wallet")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly WalletService _walletService;
        private readonly ILogger<WalletController> _logger;
        private readonly BlockchainService _blockchainService;

        public WalletController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            WalletService walletService,
            BlockchainService blockchainService,
            ILogger<WalletController> logger)
        {
            _context = context;
            _userManager = userManager;
            _walletService = walletService;
            _blockchainService = blockchainService;
            _logger = logger;
        }

        [HttpGet("my-wallet")]
        public async Task<IActionResult> GetMyWallet()
        {
            var userId = User.FindFirstValue("UserId");
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized(new { Message = "User not found" });

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                return NotFound(new { Message = "No wallet found" });

            // Get VKU Token balance
            var vkuBalance = await _walletService.GetWalletBalance(wallet.Address);
                
            return Ok(new { 
                Address = wallet.Address,
                VkuBalance = vkuBalance,
                TokenSymbol = "VKU",
                ContractAddress = _blockchainService.VkuCoinAddress
            });
        }

        [HttpPost("sync-wallet")]
        public async Task<IActionResult> SyncWalletBalance()
        {
            try
            {
                var userId = User.FindFirstValue("UserId");
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Unauthorized(new { Message = "User not found" });

                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == userId);

                if (wallet == null)
                    return NotFound(new { Message = "No wallet found" });

                // Get previous balance for comparison
                var oldBalance = wallet.Balance;
                
                // Synchronize balance from blockchain
                var newBalance = await _walletService.SyncWalletBalance(wallet.Address);
                
                return Ok(new { 
                    Message = "Wallet balance synchronized successfully", 
                    OldBalance = oldBalance,
                    NewBalance = newBalance,
                    Address = wallet.Address
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing wallet balance");
                return StatusCode(500, new { Message = "Error syncing wallet balance", Error = ex.Message });
            }
        }
    }
} 