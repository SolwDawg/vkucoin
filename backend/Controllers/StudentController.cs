using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Controllers
{
    [Authorize(Roles = "Student")]
    [Route("api/student/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly WalletService _walletService;
        private readonly ILogger<StudentController> _logger;
        private readonly IConfiguration _configuration;
        private readonly BlockchainService _blockchainService;
        private readonly QRCodeService _qrCodeService;

        public StudentController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            WalletService walletService,
            IConfiguration configuration,
            ILogger<StudentController> logger,
            BlockchainService blockchainService,
            QRCodeService qrCodeService)
        {
            _context = context;
            _userManager = userManager;
            _walletService = walletService;
            _logger = logger;
            _configuration = configuration;
            _blockchainService = blockchainService;
            _qrCodeService = qrCodeService;
        }

        // GET: api/student/activities
        [HttpGet]
        public async Task<IActionResult> GetAvailableActivities()
        {
            var activities = await _context.Activities
                .ToListAsync();

            return Ok(activities);
        }

        // GET: api/Student/activities
        [Authorize]
        [HttpGet("activities")]
        public async Task<IActionResult> GetActivities()
        {
            var userId = User.FindFirstValue("UserId");
            var studentCode = User.FindFirstValue("StudentCode");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized(new { Message = "Không tìm thấy người dùng" });

            // Lấy các hoạt động đang diễn ra hoặc sắp diễn ra
            var now = DateTime.UtcNow;
            var activities = await _context.Activities
                .Where(a => a.IsActive && a.EndDate >= now)
                .ToListAsync();

            return Ok(activities);
        }

        // POST: api/student/activities/5/register
        [HttpPost("{activityId}/register")]
        public async Task<IActionResult> RegisterActivity(int activityId)
        {
            // Lấy StudentCode từ thông tin người dùng đăng nhập
            var studentCode = User.FindFirstValue("StudentCode"); // Đảm bảo claim "StudentCode" đã được thêm khi tạo token

            if (string.IsNullOrEmpty(studentCode))
                return Unauthorized("Không xác định được mã sinh viên");

            // Tìm sinh viên bằng StudentCode
            var student = await _userManager.Users
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);

            if (student == null)
                return NotFound("Không tìm thấy sinh viên");

            // Tìm hoạt động theo ActivityId
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null)
                return NotFound("Không tìm thấy hoạt động");

            // Kiểm tra lớp được phép tham gia
            if (!string.IsNullOrEmpty(activity.AllowedClasses))
            {
                var allowedClasses = activity.AllowedClasses.Split(',');
                if (!allowedClasses.Contains(student.Class))
                    return BadRequest("Bạn không thuộc lớp được tham gia hoạt động này");
            }

            // Kiểm tra đã đăng ký chưa
            var existingRegistration = await _context.ActivityRegistrations
                .FirstOrDefaultAsync(ar =>
                    ar.ActivityId == activityId &&
                    ar.StudentId == student.Id); // Sử dụng Student.Id để kiểm tra đăng ký

            if (existingRegistration != null)
                return BadRequest("Bạn đã đăng ký hoạt động này");

            // Kiểm tra số lượng tối đa
            var currentParticipants = await _context.ActivityRegistrations
                .CountAsync(ar => ar.ActivityId == activityId);

            if (currentParticipants >= activity.MaxParticipants)
                return BadRequest("Hoạt động đã đủ số lượng");

            // Tạo bản ghi đăng ký
            var registration = new ActivityRegistration
            {
                StudentId = student.Id, // Lưu ID của sinh viên
                ActivityId = activityId
            };

            

            await _context.ActivityRegistrations.AddAsync(registration);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công, chờ phê duyệt" });
        }

        // GET: api/Student/activities/{id}/register
        [Authorize(Roles = "Student")]
        [HttpPost("activities/{id}/register")]
        public async Task<IActionResult> RegisterForActivity(int id)
        {
            var userId = User.FindFirstValue("UserId");
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized(new { Message = "Không tìm thấy người dùng" });

            // Kiểm tra xem hoạt động có tồn tại không
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
                return NotFound(new { Message = "Không tìm thấy hoạt động" });

            // Kiểm tra xem người dùng đã đăng ký chưa
            var existingRegistration = await _context.ActivityRegistrations
                .FirstOrDefaultAsync(r => r.ActivityId == id && r.StudentId == userId);
            if (existingRegistration != null)
                return BadRequest(new { Message = "Bạn đã đăng ký hoạt động này trước đó" });

            // Kiểm tra số lượng đăng ký
            var registrationCount = await _context.ActivityRegistrations
                .CountAsync(r => r.ActivityId == id);
            if (registrationCount >= activity.MaxParticipants)
                return BadRequest(new { Message = "Hoạt động đã đủ số lượng đăng ký" });

            // Kiểm tra lớp học được phép tham gia
            if (!string.IsNullOrEmpty(activity.AllowedClasses))
            {
                var allowedClasses = activity.AllowedClasses.Split(',');
                if (!allowedClasses.Contains(user.Class))
                    return BadRequest(new { Message = $"Lớp {user.Class} không được phép tham gia hoạt động này" });
            }

            // Tạo đăng ký mới
            var registration = new ActivityRegistration
            {
                StudentId = userId,
                ActivityId = id,
                RegisteredAt = DateTime.UtcNow,
                // Nếu hoạt động cấu hình auto approve thì approve luôn
                IsApproved = activity.AutoApprove,
                ApprovedAt = activity.AutoApprove ? DateTime.UtcNow : null
            };

            await _context.ActivityRegistrations.AddAsync(registration);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đăng ký hoạt động thành công",
                IsApproved = registration.IsApproved
            });
        }

        [Authorize]
        [HttpGet("my-wallet")]
        public async Task<IActionResult> GetMyWallet([FromServices] BlockchainService blockchainService)
        {
            var userId = User.FindFirstValue("UserId");
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized(new { Message = "Không tìm thấy người dùng" });

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                return NotFound(new { Message = "Bạn chưa có ví" });

            // Get VKU Token balance
            var vkuBalance = await _walletService.GetWalletBalance(wallet.Address);
                
            return Ok(new { 
                Address = wallet.Address,
                VkuBalance = vkuBalance,
                TokenSymbol = "VKU",
                ContractAddress = blockchainService.VkuCoinAddress
            });
        }

        [Authorize]
        [HttpPost("sync-wallet")]
        public async Task<IActionResult> SyncWalletBalance()
        {
            try
            {
                var userId = User.FindFirstValue("UserId");
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Unauthorized(new { Message = "Không tìm thấy người dùng" });

                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == userId);

                if (wallet == null)
                    return NotFound(new { Message = "Bạn chưa có ví" });

                // Get previous balance for comparison
                var oldBalance = wallet.Balance;
                
                // Synchronize balance from blockchain
                var newBalance = await _walletService.SyncWalletBalance(wallet.Address);
                
                return Ok(new { 
                    Message = "Đồng bộ số dư ví thành công", 
                    OldBalance = oldBalance,
                    NewBalance = newBalance,
                    Address = wallet.Address
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing wallet balance");
                return StatusCode(500, new { Message = "Lỗi khi đồng bộ số dư ví", Error = ex.Message });
            }
        }

        [Authorize(Roles = "Student")]
        [HttpPost("convert-to-points")]
        public async Task<IActionResult> ConvertCoinToPoints(
            [FromBody] ConvertCoinRequest request,
            [FromServices] BlockchainService blockchainService)
        {
            try
            {
                // Get student info using UserId claim
                var userId = User.FindFirstValue("UserId");
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogError("UserId claim not found in token");
                    return Unauthorized("Invalid token: UserId not found");
                }

                _logger.LogInformation($"Looking up student with UserId: {userId}");
                
                var student = await _userManager.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (student == null)
                {
                    _logger.LogError($"Student not found for UserId: {userId}");
                    return NotFound("Student not found");
                }

                _logger.LogInformation($"Found student: {student.FullName} (ID: {student.Id})");

                // Create wallet if it doesn't exist
                if (student.Wallet == null)
                {
                    _logger.LogInformation($"Creating new wallet for student: {student.Id}");
                    var wallet = await _walletService.CreateWalletWithZeroBalance(userId);
                    student.Wallet = wallet;
                    await _context.SaveChangesAsync();
                    
                    // Sync the wallet balance after creation
                    await _walletService.SyncWalletBalance(wallet.Address);
                }

                // Check if amount is divisible by 10
                if (request.Amount % 10 != 0)
                    return BadRequest("Amount must be divisible by 10 (10 coins = 1 training point)");

                // Sync wallet balance before checking
                var currentBalance = await _walletService.SyncWalletBalance(student.Wallet.Address);
                
                // Check balance
                if (currentBalance < request.Amount)
                    return BadRequest($"Insufficient coin balance. Current balance: {currentBalance}");

                // Get admin wallet address from configuration
                var adminAddress = _configuration["Blockchain:VkuCoinAddress"];
                if (string.IsNullOrEmpty(adminAddress))
                    return StatusCode(500, "Admin wallet address not configured");

                // Transfer coins to admin wallet
                var transferResult = await blockchainService.TransferTokens(
                    student.Wallet.Address,
                    adminAddress,
                    request.Amount);

                if (!transferResult.Success)
                    return StatusCode(500, $"Failed to transfer coins: {transferResult.Message}");

                // Update database
                student.Wallet.Balance = currentBalance - request.Amount;
                // Convert coins to points (10 coins = 1 point)
                student.TrainingPoints += (int)(request.Amount / 10);

                // Add transaction log
                _context.TransactionLogs.Add(new TransactionLog
                {
                    UserId = userId,
                    Amount = request.Amount,
                    TransactionType = "CONVERT_TO_POINTS",
                    Description = $"Converted {request.Amount} coins to {request.Amount / 10} training points",
                    TransactionHash = transferResult.TransactionHash,
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                // Final sync to ensure accuracy
                var finalBalance = await _walletService.SyncWalletBalance(student.Wallet.Address);

                return Ok(new
                {
                    Message = $"Successfully converted {request.Amount} coins to {request.Amount / 10} training points",
                    NewBalance = finalBalance,
                    NewPoints = student.TrainingPoints,
                    TransactionHash = transferResult.TransactionHash
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting coin to points");
                return StatusCode(500, "System error while converting coins");
            }
        }

        [HttpPost("scan-qr-code")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> ScanQRCode([FromBody] ScanQRCodeDto dto)
        {
            try
            {
                _logger.LogInformation($"Processing QR code scan: {dto.QrCodePayload}");
                
                // Parse the QR code payload
                var qrData = _qrCodeService.ParseQRCodePayload(dto.QrCodePayload);
                if (qrData == null)
                {
                    return BadRequest(new { Message = "Invalid QR code format" });
                }
                
                var (activityId, token, expiration) = qrData.Value;
                
                // Find the activity
                var activity = await _context.Activities.FindAsync(activityId);
                if (activity == null)
                {
                    return NotFound(new { Message = "Activity not found" });
                }
                
                // Validate the token
                if (activity.QrCodeToken != token)
                {
                    return BadRequest(new { Message = "Invalid QR code token" });
                }
                
                // Check if the QR code has expired
                if (DateTime.UtcNow > activity.QrCodeExpiration)
                {
                    return BadRequest(new { Message = "QR code has expired" });
                }
                
                // Get the current user (student)
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "User not authenticated" });
                }
                
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found" });
                }
                
                // Check if the user is a student
                if (user.Role != "Student")
                {
                    return BadRequest(new { Message = "Only students can confirm participation" });
                }
                
                // Find the registration
                var registration = await _context.ActivityRegistrations
                    .FirstOrDefaultAsync(ar => ar.ActivityId == activityId && ar.StudentId == userId);
                
                if (registration == null)
                {
                    return BadRequest(new { Message = "You are not registered for this activity" });
                }
                
                if (!registration.IsApproved)
                {
                    return BadRequest(new { Message = "Your registration has not been approved yet" });
                }
                
                if (registration.IsParticipationConfirmed)
                {
                    return BadRequest(new { Message = "You have already confirmed your participation" });
                }
                
                // Confirm participation
                registration.IsParticipationConfirmed = true;
                registration.ParticipationConfirmedAt = DateTime.UtcNow;
                
                // Transfer reward coins if configured
                var result = await _walletService.AddCoinToWallet(
                    userId,
                    activity.RewardCoin,
                    activity.Name
                );
                
                if (!result.Success)
                {
                    _logger.LogError($"Failed to transfer reward coins: {result.Message}");
                    // Continue with participation confirmation but log the error
                }
                
                await _context.SaveChangesAsync();
                
                return Ok(new
                {
                    Message = "Participation confirmed successfully",
                    RewardCoins = activity.RewardCoin,
                    TransactionHash = result?.TransactionHash,
                    NewBalance = result?.NewBalance
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing QR code scan");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }

        // GET: api/student/Student/participation-history
        [HttpGet("participation-history")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetParticipationHistory()
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "User not authenticated" });
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { Message = "User not found" });
                }

                // Get all registrations for this student with activity details
                var registrations = await _context.ActivityRegistrations
                    .Include(r => r.Activity)
                    .Where(r => r.StudentId == userId)
                    .OrderByDescending(r => r.RegisteredAt)
                    .ToListAsync();

                var participationHistory = registrations.Select(r => new StudentParticipationHistoryDto
                {
                    ActivityId = r.ActivityId,
                    ActivityName = r.Activity.Name,
                    Description = r.Activity.Description,
                    StartDate = r.Activity.StartDate,
                    EndDate = r.Activity.EndDate,
                    Location = r.Activity.Location,
                    Organizer = r.Activity.Organizer,
                    RewardCoin = r.Activity.RewardCoin,
                    ImageUrl = r.Activity.ImageUrl,
                    RegisteredAt = r.RegisteredAt,
                    IsApproved = r.IsApproved,
                    ApprovedAt = r.ApprovedAt,
                    IsParticipationConfirmed = r.IsParticipationConfirmed,
                    ParticipationConfirmedAt = r.ParticipationConfirmedAt,
                    EvidenceImageUrl = r.EvidenceImageUrl,
                    Status = GetParticipationStatus(r),
                    RewardReceived = r.IsParticipationConfirmed
                }).ToList();

                var summary = new StudentParticipationHistoryListDto
                {
                    Participations = participationHistory,
                    TotalActivities = registrations.Count,
                    CompletedActivities = registrations.Count(r => r.IsParticipationConfirmed),
                    TotalCoinsEarned = registrations.Where(r => r.IsParticipationConfirmed).Sum(r => r.Activity.RewardCoin)
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting participation history");
                return StatusCode(500, new { Message = "An error occurred while retrieving participation history" });
            }
        }

        private string GetParticipationStatus(ActivityRegistration registration)
        {
            if (!registration.IsApproved)
            {
                return "Chờ phê duyệt";
            }
            
            if (registration.IsParticipationConfirmed)
            {
                return "Đã hoàn thành";
            }
            
            if (DateTime.UtcNow > registration.Activity.EndDate)
            {
                return "Đã kết thúc - Chưa xác nhận";
            }
            
            if (DateTime.UtcNow >= registration.Activity.StartDate && DateTime.UtcNow <= registration.Activity.EndDate)
            {
                return "Đang diễn ra";
            }
            
            return "Sắp diễn ra";
        }

        // GET: api/student/Student/{activityId}/registrations
        [HttpGet("{activityId}/registrations")]
        public async Task<IActionResult> GetActivityRegistrations(int activityId)
        {
            try
            {
                // Find the activity
                var activity = await _context.Activities.FindAsync(activityId);
                if (activity == null)
                {
                    return NotFound(new { Message = "Activity not found" });
                }

                // Get all registrations for this activity
                var registrations = await _context.ActivityRegistrations
                    .Include(r => r.Student)
                    .Where(r => r.ActivityId == activityId)
                    .ToListAsync();

                return Ok(registrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting registrations for activity {activityId}");
                return StatusCode(500, new { Message = "An error occurred while retrieving registrations" });
            }
        }
    }
}