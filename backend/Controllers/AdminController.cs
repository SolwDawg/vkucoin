using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IO;
using ExcelDataReader;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;
using Nethereum.Web3;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ExcelService _excelService;
        private readonly WalletService _walletService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            UserManager<User> userManager,
            ExcelService excelService,
            WalletService walletService,
            ApplicationDbContext context,
            ILogger<AdminController> logger)
        {
            _userManager = userManager;
            _excelService = excelService;
            _walletService = walletService;
            _context = context;
            _logger = logger;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("import-users")]
        public async Task<IActionResult> ImportUsers(IFormFile file)
        {
            _logger.LogInformation($"Authenticated User: {User.Identity?.Name}");
            _logger.LogInformation($"User Roles: {string.Join(",", User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value))}");

            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "Vui lòng chọn file" });

            if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                return BadRequest(new { Message = "Chỉ chấp nhận file Excel (.xlsx, .xls)" });

            try
            {
                using var stream = file.OpenReadStream();
                var users = await _excelService.ReadUsersFromExcel(stream); // Đọc người dùng từ Excel

                var results = new List<UserImportResultDto>();
                foreach (var user in users)
                {
                    var result = new UserImportResultDto
                    {
                        StudentCode = user.StudentCode,
                        FullName = user.FullName
                    };

                    try
                    {
                        var email = GenerateEmail(user.FullName);
                        var password = GeneratePassword(user.FullName, user.DateOfBirth);

                        if (await _userManager.FindByEmailAsync(email) != null)
                        {
                            result.Message = "Email đã tồn tại";
                            results.Add(result);
                            continue;
                        }

                        // Tạo User từ thông tin người dùng
                        var newUser = new User
                        {
                            UserName = email,
                            Email = email,
                            FullName = user.FullName,
                            StudentCode = user.StudentCode,
                            Class = user.Class,
                            DateOfBirth = user.DateOfBirth,
                            Role = "Student",
                            EmailConfirmed = true,
                            IsStudent = true
                        };

                        var createResult = await _userManager.CreateAsync(newUser, password);
                        if (createResult.Succeeded)
                        {
                            await _userManager.AddToRoleAsync(newUser, "Student");

                            // Lưu user trước để có ID
                            await _context.SaveChangesAsync();

                            // Tạo ví Ethereum và gán UserId cho ví
                            var wallet = await _walletService.CreateWalletWithZeroBalance(newUser.Id);

                            result.Email = email;
                            result.Password = password;
                            result.WalletAddress = wallet.Address;
                            result.Message = "Thành công";
                        }
                        else
                        {
                            result.Message = string.Join(", ", createResult.Errors.Select(e => e.Description));
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Message = $"Lỗi: {ex.Message}";
                        _logger.LogError(ex, $"Lỗi khi import người dùng {user.StudentCode}");
                    }

                    results.Add(result);
                }

                return Ok(new
                {
                    Message = "Hoàn thành import người dùng",
                    Results = results
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý file Excel");
                return StatusCode(500, new { Message = "Lỗi khi xử lý file Excel", Error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("students/all")]
        public async Task<IActionResult> GetStudents()
        {
            try
            {
                // Lấy tất cả sinh viên với thông tin ví
                var students = await _userManager.Users
                    .Where(u => u.Role == "Student")
                    .Include(u => u.Wallet)
                    .Select(u => new StudentDto
                    {
                        StudentCode = u.StudentCode,
                        FullName = u.FullName,
                        Email = u.Email,
                        Class = u.Class,
                        DateOfBirth = u.DateOfBirth,
                        WalletAddress = u.Wallet.Address,
                        WalletBalance = u.Wallet.Balance,
                    })
                    .ToListAsync();

                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching students");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("students-by-class/{className}")]
        public async Task<IActionResult> GetStudentsByClass(string className)
        {
            try
            {
                // Lấy danh sách sinh viên cùng lớp
                var students = await _userManager.Users
                    .Where(u => u.Class == className && u.Role == "Student")
                    .Select(u => new StudentDto
                    {
                        StudentCode = u.StudentCode,
                        FullName = u.FullName,
                        Email = u.Email,
                        DateOfBirth = u.DateOfBirth,
                        WalletAddress = u.Wallet.Address,
                        WalletBalance = u.Wallet.Balance
                    })
                    .ToListAsync();

                return Ok(new
                {
                    ClassName = className,
                    TotalStudents = students.Count,
                    Students = students
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting students for class {className}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-student/{studentCode}")]
        public async Task<IActionResult> UpdateStudent(string studentCode, [FromBody] UpdateStudentDto dto)
        {
            try
            {
                var student = await _userManager.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.StudentCode == studentCode && u.Role == "Student");

                if (student == null)
                    return NotFound(new { Message = "Student not found" });

                // Lưu thông tin cũ
                var originalValues = new
                {
                    FullName = student.FullName,
                    Class = student.Class,
                    DateOfBirth = student.DateOfBirth,
                    Email = student.Email
                };

                // Chỉ cập nhật các trường có giá trị thực sự thay đổi
                if (dto.FullName != null)
                    student.FullName = dto.FullName;

                if (dto.Class != null)
                    student.Class = dto.Class;

                if (dto.DateOfBirth.HasValue)
                    student.DateOfBirth = dto.DateOfBirth.Value;

                if (!string.IsNullOrEmpty(dto.NewEmail))
                {
                    if (await _userManager.FindByEmailAsync(dto.NewEmail) != null)
                        return BadRequest(new { Message = "Email already exists" });

                    student.Email = dto.NewEmail;
                    student.UserName = dto.NewEmail;
                }

                // Kiểm tra xem có thay đổi gì không
                var changesDetected = student.FullName != originalValues.FullName ||
                                     student.Class != originalValues.Class ||
                                     student.DateOfBirth != originalValues.DateOfBirth ||
                                     student.Email != originalValues.Email;

                if (!changesDetected)
                    return Ok(new { Message = "No changes detected", Student = originalValues });

                var result = await _userManager.UpdateAsync(student);

                if (!result.Succeeded)
                    return BadRequest(new { Errors = result.Errors });

                return Ok(new
                {
                    Message = "Update successful",
                    Original = originalValues,
                    Updated = new
                    {
                        student.FullName,
                        student.Class,
                        student.DateOfBirth,
                        student.Email,
                        student.Wallet?.Address
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating student {studentCode}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-student/{studentCode}")]
        public async Task<IActionResult> DeleteStudent(string studentCode)
        {
            try
            {
                // Tìm sinh viên (không include wallet để xóa cascade)
                var student = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.StudentCode == studentCode && u.Role == "Student");

                if (student == null)
                    return NotFound(new { Message = "Không tìm thấy sinh viên" });

                // Xóa wallet trước (nếu cần xử lý gì đó trước khi xóa)
                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == student.Id);

                if (wallet != null)
                    _context.Wallets.Remove(wallet);

                // Xóa user
                var result = await _userManager.DeleteAsync(student);

                if (!result.Succeeded)
                    return BadRequest(new { Errors = result.Errors });

                return Ok(new
                {
                    Message = $"Đã xóa sinh viên {studentCode}",
                    DeletedEmail = student.Email,
                    DeletedWallet = wallet?.Address
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa sinh viên {studentCode}");
                return StatusCode(500, new { Message = "Lỗi server khi xóa" });
            }
        }

        private List<string> GetChangedFields(object oldObj, object newObj)
        {
            var changedFields = new List<string>();
            var oldProps = oldObj.GetType().GetProperties();
            var newProps = newObj.GetType().GetProperties();

            foreach (var oldProp in oldProps)
            {
                var newProp = newProps.FirstOrDefault(p => p.Name == oldProp.Name);
                if (newProp != null)
                {
                    var oldValue = oldProp.GetValue(oldObj)?.ToString();
                    var newValue = newProp.GetValue(newObj)?.ToString();

                    if (oldValue != newValue)
                    {
                        changedFields.Add(oldProp.Name);
                    }
                }
            }

            return changedFields;
        }



        private string GenerateEmail(string fullName)
        {
            var nameParts = fullName.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var normalized = string.Join("", nameParts.Select(RemoveDiacritics));
            return $"{normalized}@vku.udn.vn";
        }

        private string GeneratePassword(string fullName, DateTime dob)
        {
            var firstName = RemoveDiacritics(fullName.Split(' ').Last().ToLower());
            var capitalized = char.ToUpper(firstName[0]) + firstName.Substring(1);
            return $"{capitalized}{dob:ddMMyyyy}!"; // Password format: FirstName + DateOfBirth + '!'
        }

        private string RemoveDiacritics(string text)
        {
            var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
            var builder = new System.Text.StringBuilder();

            foreach (var c in normalized)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                    builder.Append(c);
            }

            return builder.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("check-transaction/{txHash}")]
        public async Task<IActionResult> CheckTransactionStatus(
            string txHash,
            [FromServices] BlockchainService blockchainService)
        {
            try
            {
                // Create a Web3 instance
                var web3 = new Nethereum.Web3.Web3(blockchainService.GetNodeUrl());
                
                // Get transaction receipt
                var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
                
                if (receipt == null)
                {
                    return Ok(new
                    {
                        TxHash = txHash,
                        Status = "Pending",
                        Message = "Transaction is still pending or not found"
                    });
                }
                
                bool success = receipt.Status.Value == 1;
                
                // Get transaction itself for more details
                var tx = await web3.Eth.Transactions.GetTransactionByHash.SendRequestAsync(txHash);
                
                return Ok(new
                {
                    TxHash = txHash,
                    Status = success ? "Success" : "Failed",
                    BlockNumber = receipt.BlockNumber.Value,
                    BlockHash = receipt.BlockHash,
                    GasUsed = receipt.GasUsed.Value.ToString(),
                    From = tx?.From,
                    To = tx?.To,
                    Value = tx != null ? Nethereum.Web3.Web3.Convert.FromWei(tx.Value.Value).ToString() : "0",
                    Logs = receipt.Logs.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking transaction {txHash}");
                return StatusCode(500, new { 
                    Message = "Error checking transaction status", 
                    Error = ex.Message 
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("my-wallet")]
        public async Task<IActionResult> GetAdminWallet([FromServices] BlockchainService blockchainService)
        {
            try
            {
                var userId = User.FindFirstValue("UserId");
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Unauthorized(new { Message = "Không tìm thấy người dùng admin" });

                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == userId);

                if (wallet == null)
                    return NotFound(new { Message = "Không tìm thấy ví admin" });

                // Get VKU Token balance using WalletService
                var vkuBalance = await _walletService.GetWalletBalance(wallet.Address);
                
                // Sync wallet balance to ensure database is up to date
                await _walletService.SyncWalletBalance(wallet.Address);

                return Ok(new { 
                    Address = wallet.Address,
                    VkuBalance = vkuBalance,
                    TokenSymbol = "VKU",
                    ContractAddress = blockchainService.VkuCoinAddress
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin wallet");
                return StatusCode(500, new { Message = "Lỗi khi lấy thông tin ví admin", Error = ex.Message });
            }
        }
    }
}