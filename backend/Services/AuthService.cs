using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Models.AuthModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class AuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly WalletService _walletService;

        public AuthService(
            UserManager<User> userManager,
            IConfiguration configuration,
            ApplicationDbContext context,
            WalletService walletService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
            _walletService = walletService;
        }

        public async Task<AuthResponse> Login(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
                throw new Exception("Email không tồn tại");

            if (!await _userManager.CheckPasswordAsync(user, request.Password))
                throw new Exception("Mật khẩu không chính xác");

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);
            
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserId", user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            
            // Add role claims explicitly
            foreach (var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = GetToken(authClaims);

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == user.Id);
            if (wallet != null)
            {
                wallet.Balance = await _walletService.GetWalletBalance(wallet.Address);
                await _context.SaveChangesAsync();
            }
            return new AuthResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo,
                User = user,
                Wallet = wallet
            };
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var jwtSecret = _configuration["JWT:Secret"] ?? 
                throw new InvalidOperationException("JWT:Secret is not configured");
            
            var authSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(
                    authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return token;
        }
    }
}
