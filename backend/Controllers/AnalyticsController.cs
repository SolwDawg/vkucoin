using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs;

namespace backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// Get comprehensive dashboard analytics including all statistics
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardAnalyticsDto>> GetDashboardAnalytics()
        {
            try
            {
                var analytics = await _analyticsService.GetDashboardAnalyticsAsync();
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu thống kê", error = ex.Message });
            }
        }

        /// <summary>
        /// Get overview statistics (total counts and basic metrics)
        /// </summary>
        [HttpGet("overview")]
        public async Task<ActionResult<OverviewStatisticsDto>> GetOverviewStatistics()
        {
            try
            {
                var overview = await _analyticsService.GetOverviewStatisticsAsync();
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy tổng quan thống kê", error = ex.Message });
            }
        }

        /// <summary>
        /// Get top performing activities by participation
        /// </summary>
        [HttpGet("activities/top")]
        public async Task<ActionResult<List<ActivityStatDto>>> GetTopActivities([FromQuery] int limit = 10)
        {
            try
            {
                var activities = await _analyticsService.GetTopActivitiesAsync(limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê hoạt động", error = ex.Message });
            }
        }

        /// <summary>
        /// Get monthly statistics for the past N months
        /// </summary>
        [HttpGet("monthly")]
        public async Task<ActionResult<List<MonthlyStatsDto>>> GetMonthlyStats([FromQuery] int months = 12)
        {
            try
            {
                if (months < 1 || months > 24)
                {
                    return BadRequest(new { message = "Số tháng phải từ 1 đến 24" });
                }

                var monthlyStats = await _analyticsService.GetMonthlyStatsAsync(months);
                return Ok(monthlyStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê theo tháng", error = ex.Message });
            }
        }

        /// <summary>
        /// Get participation statistics by class
        /// </summary>
        [HttpGet("classes")]
        public async Task<ActionResult<List<ClassParticipationDto>>> GetClassParticipationStats()
        {
            try
            {
                var classStats = await _analyticsService.GetClassParticipationStatsAsync();
                return Ok(classStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê theo lớp", error = ex.Message });
            }
        }

        /// <summary>
        /// Get token distribution and top earners statistics
        /// </summary>
        [HttpGet("tokens")]
        public async Task<ActionResult<TokenDistributionDto>> GetTokenDistribution()
        {
            try
            {
                var tokenStats = await _analyticsService.GetTokenDistributionAsync();
                return Ok(tokenStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê token", error = ex.Message });
            }
        }
    }
} 