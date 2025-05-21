using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin/[controller]")]
    [ApiController]
    public class ActivitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ActivitiesController> _logger;
        private readonly UserManager<User> _userManager;
        private readonly WalletService _walletService;
        private readonly BlockchainService _blockchainService;
        private readonly QRCodeService _qrCodeService;

        public ActivitiesController(
            ApplicationDbContext context,
            ILogger<ActivitiesController> logger,
            UserManager<User> userManager,
            WalletService walletService,
            BlockchainService blockchainService,
            QRCodeService qrCodeService)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _walletService = walletService;
            _blockchainService = blockchainService;
            _qrCodeService = qrCodeService;
        }

        // GET: api/admin/activities
        [HttpGet]
        public async Task<IActionResult> GetAllActivities()
        {
            var activities = await _context.Activities
                .Where(a => a.IsActive)
                .ToListAsync();

            return Ok(activities);
        }

        // GET: api/admin/activities/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();

            return Ok(activity);
        }

        // POST: api/admin/activities
        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] CreateActivityDto dto)
        {
            var activity = new Activity
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                RewardCoin = dto.RewardCoin,
                MaxParticipants = dto.MaxParticipants,
                ImageUrl = dto.ImageUrl,
                Location = dto.Location,
                AutoApprove = dto.AutoApprove,
                Organizer = dto.Organizer
            };

            await _context.Activities.AddAsync(activity);
            await _context.SaveChangesAsync();

            // Generate QR code after the activity is created (to have the activity ID)
            try
            {
                var (token, qrCodeUrl, expiration) = _qrCodeService.GenerateQRCodeForActivity(activity.Id, activity.EndDate);
                
                // Update the activity with QR code information
                activity.QrCodeToken = token;
                activity.QrCodeUrl = qrCodeUrl;
                activity.QrCodeExpiration = expiration;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Generated QR code for activity {activity.Id}: {qrCodeUrl}");
            }
            catch (Exception ex)
            {
                // Log error but don't fail the request
                _logger.LogError(ex, $"Failed to generate QR code for activity {activity.Id}");
            }

            return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
        }

        // PUT: api/admin/activities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateActivity(int id, [FromBody] UpdateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();

            activity.Name = dto.Name ?? activity.Name;
            activity.Description = dto.Description ?? activity.Description;
            activity.StartDate = dto.StartDate ?? activity.StartDate;
            activity.EndDate = dto.EndDate ?? activity.EndDate;
            activity.RewardCoin = dto.RewardCoin ?? activity.RewardCoin;
            activity.MaxParticipants = dto.MaxParticipants ?? activity.MaxParticipants;
            

            await _context.SaveChangesAsync();

            return Ok(activity);
        }

        // DELETE: api/admin/activities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();

            // Soft delete
            activity.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/admin/activities/5/registrations
        [HttpGet("{id}/registrations")]
        public async Task<IActionResult> GetActivityRegistrations(int id)
        {
            var registrations = await _context.ActivityRegistrations
                .Include(ar => ar.Student)
                .Where(ar => ar.ActivityId == id)
                .ToListAsync();

            return Ok(registrations);
        }

        // POST: api/admin/activities/5/approve/student123
        [HttpPost("{activityId}/approve/{studentCode}")]
        public async Task<IActionResult> ApproveStudentRegistration(int activityId, string studentCode)
        {
            var student = await _userManager.Users
              .Include(s => s.Wallet)
              .FirstOrDefaultAsync(s => s.StudentCode == studentCode);
            // Tìm bản ghi đăng ký
            var registration = await _context.ActivityRegistrations
                .Include(ar => ar.Activity)
                .FirstOrDefaultAsync(ar =>
                    ar.ActivityId == activityId &&
                    ar.StudentId == student.Id);
            if (registration == null)
                return NotFound("Không tìm thấy bản ghi đăng ký");

            if (registration.IsApproved)
                return BadRequest("Đăng ký đã được phê duyệt trước đó");

            // Cập nhật trạng thái phê duyệt
            registration.IsApproved = true;
            registration.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Phê duyệt đăng ký thành công",
                Registration = new
                {
                    registration.ActivityId,
                    registration.StudentId,
                    registration.IsApproved,
                    registration.ApprovedAt
                }
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/assign-classes")]
        public async Task<IActionResult> AssignClassesToActivity(
    int id,
    [FromBody] AssignClassToActivityDto dto)
        {
            var activityToUpdate = await _context.Activities.FindAsync(id);
            if (activityToUpdate == null) return NotFound();

            activityToUpdate.AllowedClasses = dto.ClassNames;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Đã chỉ định lớp {dto.ClassNames} tham gia hoạt động",
                Activity = activityToUpdate
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{activityId}/confirm-participation/{studentCode}")]
        public async Task<IActionResult> ConfirmStudentParticipation(
            int activityId,
            string studentCode)
        {
            _logger.LogInformation($"Starting confirmation of participation for student {studentCode} in activity {activityId}");
            
            // Find student by StudentCode
            var student = await _userManager.Users
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);

            if (student == null)
                return NotFound(new { Message = "Không tìm thấy sinh viên" });

            if (student.Wallet == null)
                return BadRequest(new { Message = "Sinh viên chưa có ví" });

            // Find activity
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null)
                return NotFound(new { Message = "Không tìm thấy hoạt động" });

            // Find registration by ActivityId and StudentId
            var registration = await _context.ActivityRegistrations
                .FirstOrDefaultAsync(ar => ar.ActivityId == activityId && ar.StudentId == student.Id);

            if (registration == null)
                return BadRequest(new { Message = "Sinh viên chưa đăng ký hoạt động này" });

            if (!registration.IsApproved)
                return BadRequest(new { Message = "Đăng ký chưa được phê duyệt" });

            if (registration.IsParticipationConfirmed)
                return BadRequest(new { Message = "Sinh viên đã được xác nhận tham gia trước đó" });

            // Find admin user (assuming there's only one admin account or we're using the first one found)
            var adminUser = await _userManager.GetUsersInRoleAsync("Admin");
            var admin = adminUser.FirstOrDefault();
            if (admin == null)
                return StatusCode(500, new { Message = "Không tìm thấy tài khoản admin" });

            // Get admin wallet
            var adminWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == admin.Id);
            if (adminWallet == null)
                return StatusCode(500, new { Message = "Admin chưa có ví" });

            // Check if admin has enough balance
            if (adminWallet.Balance < activity.RewardCoin)
            {
                return BadRequest(new { 
                    Message = $"Số dư ví admin không đủ ({adminWallet.Balance}) để thưởng ({activity.RewardCoin}) coin",
                    AdminBalance = adminWallet.Balance,
                    RequiredAmount = activity.RewardCoin
                });
            }

            // Update participation status
            registration.IsParticipationConfirmed = true;
            registration.ParticipationConfirmedAt = DateTime.UtcNow;

            // Transfer coins from admin to student
            _logger.LogInformation($"Transferring {activity.RewardCoin} coins from admin ({adminWallet.Address}) to student ({student.Wallet.Address})");
            var result = await _walletService.AddCoinToWallet(
                student.Id,
                activity.RewardCoin,
                activity.Name
            );

            if (!result.Success)
            {
                _logger.LogError($"Failed to transfer coins: {result.Message}");
                return StatusCode(500, new { Message = result.Message });
            }

            await _context.SaveChangesAsync();

            // Log successful transaction
            _logger.LogInformation($"Successfully transferred {activity.RewardCoin} coins to student {studentCode}. Transaction hash: {result.TransactionHash}");

            return Ok(new
            {
                Message = "Đã xác nhận sinh viên tham gia và chuyển coin thành công",
                TransactionHash = result.TransactionHash,
                NewBalance = result.NewBalance,
                Student = new {
                    student.FullName,
                    student.StudentCode,
                    student.Wallet.Address
                },
                Activity = new {
                    activity.Id,
                    activity.Name,
                    activity.RewardCoin
                }
            });
        }

        // New endpoint for QR code scanning
        [HttpPost("scan-qr")]
        [Authorize] // Both admins and students can scan
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
        
        // GET: api/admin/activities/5/qrcode
        [HttpGet("{id}/qrcode")]
        public async Task<IActionResult> GetActivityQRCode(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();
            
            if (string.IsNullOrEmpty(activity.QrCodeUrl))
            {
                // Generate a new QR code if one doesn't exist
                try
                {
                    var (token, qrCodeUrl, expiration) = _qrCodeService.GenerateQRCodeForActivity(activity.Id, activity.EndDate);
                    
                    // Update the activity with QR code information
                    activity.QrCodeToken = token;
                    activity.QrCodeUrl = qrCodeUrl;
                    activity.QrCodeExpiration = expiration;
                    
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to generate QR code for activity {activity.Id}");
                    return StatusCode(500, new { Message = "Failed to generate QR code" });
                }
            }
            
            return Ok(new
            {
                activity.Id,
                activity.Name,
                activity.QrCodeUrl,
                activity.QrCodeExpiration
            });
        }
    }
}