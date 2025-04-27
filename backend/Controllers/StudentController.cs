using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize(Roles = "Student")]
    [Route("api/student/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public StudentController(
            ApplicationDbContext context,
            UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/student/activities
        [HttpGet]
        public async Task<IActionResult> GetAvailableActivities()
        {
            var activities = await _context.Activities
                .Where(a => a.IsActive && a.StartDate > DateTime.UtcNow)
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

    }
}