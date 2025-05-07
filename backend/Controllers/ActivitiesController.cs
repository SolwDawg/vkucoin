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
                MaxParticipants = dto.MaxParticipants,
                ImageUrl = dto.ImageUrl,
                Location = dto.Location,
                AutoApprove = dto.AutoApprove,
                Organizer = dto.Organizer
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

        [HttpPost("{activityId}/confirm-participation/{studentCode}")]
        public async Task<IActionResult> ConfirmStudentParticipation(
    int activityId,
    string studentCode,
    [FromServices] WalletService walletService)
        {
            // Tìm sinh viên bằng StudentCode
            var student = await _userManager.Users
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);

            if (student == null)
                return NotFound("Không tìm thấy sinh viên");

            // Tìm hoạt động
            var activity = await _context.Activities.FindAsync(activityId);
            if (activity == null)
                return NotFound("Không tìm thấy hoạt động");

            // Tìm bản ghi đăng ký theo ActivityId và StudentCode
            var registration = await _context.ActivityRegistrations
                .Include(ar => ar.Student) // Đảm bảo truy xuất dữ liệu liên quan
                .FirstOrDefaultAsync(ar => ar.ActivityId == activityId && ar.Student.StudentCode == studentCode);

            if (registration == null || !registration.IsApproved)
                return BadRequest("Đăng ký chưa được phê duyệt hoặc không tồn tại");

            if (registration.IsParticipationConfirmed)
                return BadRequest("Sinh viên đã được xác nhận tham gia trước đó");

            // Cập nhật trạng thái đã tham gia
            registration.IsParticipationConfirmed = true;
            registration.ParticipationConfirmedAt = DateTime.UtcNow;

            // Cộng coin vào ví sinh viên
            var result = await walletService.AddCoinToWallet(
                student.Id,
                activity.RewardCoin,
                activity.Name
            );

            if (!result.Success)
                return BadRequest("Lỗi khi cộng coin vào ví sinh viên");

            // Cập nhật số dư ví sinh viên
            student.Wallet.Balance += activity.RewardCoin;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã xác nhận sinh viên tham gia và cộng coin",
                NewBalance = student.Wallet.Balance
            });
        }

    }
}