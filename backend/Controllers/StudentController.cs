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

        public StudentController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            WalletService walletService,
            ILogger<StudentController> logger)
        {
            _context = context;
            _userManager = userManager;
            _walletService = walletService;
            _logger = logger;
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
    }
}