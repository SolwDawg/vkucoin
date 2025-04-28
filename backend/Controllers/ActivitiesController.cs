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

        public ActivitiesController(
            ApplicationDbContext context,
            ILogger<ActivitiesController> logger,
            UserManager<User> userManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
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
                MaxParticipants = dto.MaxParticipants
            };

            await _context.Activities.AddAsync(activity);
            await _context.SaveChangesAsync();

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
        public async Task<IActionResult> ApproveRegistration(
    int activityId,
    string studentCode,
    [FromServices] WalletService walletService)
        {
            // Tìm sinh viên bằng studentCode
            var student = await _userManager.Users
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);

            if (student == null) return NotFound("Không tìm thấy sinh viên");

            // Tìm bản ghi đăng ký hoạt động
            var registration = await _context.ActivityRegistrations
                .Include(ar => ar.Activity)
                .FirstOrDefaultAsync(ar =>
                    ar.ActivityId == activityId &&
                    ar.StudentId == student.Id); // Sử dụng student.Id vì ActivityRegistrations liên kết qua Id

            if (registration == null) return NotFound("Không tìm thấy bản ghi đăng ký hoạt động");

            // Cập nhật trạng thái
            registration.IsApproved = true;
            registration.ApprovedAt = DateTime.UtcNow;

            // Cộng coin vào ví sinh viên
            

            return Ok(new
            {
                Message = "Đã phê duyệt tham gia hoạt động",
                
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
        [HttpPost("confirm-participation")]
        public async Task<IActionResult> ConfirmParticipation(
            [FromBody] ConfirmParticipationDto dto,
            [FromServices] WalletService walletService)
        {
            // Kiểm tra sinh viên có thuộc lớp được chỉ định không
            var student = await _userManager.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.StudentCode == dto.StudentCode);

            if (student == null) return NotFound("Không tìm thấy sinh viên");

            var activityToConfirm = await _context.Activities.FindAsync(dto.ActivityId);
            if (activityToConfirm == null) return NotFound("Không tìm thấy hoạt động");

            // Kiểm tra lớp của sinh viên có được phép tham gia
            if (!string.IsNullOrEmpty(activityToConfirm.AllowedClasses))
            {
                var allowedClasses = activityToConfirm.AllowedClasses.Split(',');
                if (!allowedClasses.Contains(student.Class))
                    return BadRequest("Sinh viên không thuộc lớp được chỉ định");
            }

            // Tạo hoặc cập nhật bản ghi tham gia
            var participation = await _context.ActivityRegistrations
                .FirstOrDefaultAsync(ar =>
                    ar.ActivityId == dto.ActivityId &&
                    ar.StudentId == student.Id);

            if (participation == null)
            {
                participation = new ActivityRegistration
                {
                    ActivityId = dto.ActivityId,
                    StudentId = student.Id,
                    EvidenceImageUrl = dto.EvidenceImageUrl
                };
                await _context.ActivityRegistrations.AddAsync(participation);
            }

            // Xác nhận tham gia và cộng coin
            participation.IsApproved = true;
            participation.ApprovedAt = DateTime.UtcNow;

            // Cộng coin vào ví
            var result = await walletService.AddCoinToWallet(
                student.Id,
                activityToConfirm.RewardCoin,
                activityToConfirm.Name);

            if (!result.Success) return BadRequest("Lỗi khi cộng coin");
            
            student.Wallet.Balance += activityToConfirm.RewardCoin;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã xác nhận tham gia và cộng coin",
                NewBalance = student.Wallet.Balance
            });
        }
    }
}