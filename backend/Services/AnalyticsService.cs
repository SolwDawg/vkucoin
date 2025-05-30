using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IAnalyticsService
    {
        Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync();
        Task<OverviewStatisticsDto> GetOverviewStatisticsAsync();
        Task<List<ActivityStatDto>> GetTopActivitiesAsync(int limit = 10);
        Task<List<MonthlyStatsDto>> GetMonthlyStatsAsync(int months = 12);
        Task<List<ClassParticipationDto>> GetClassParticipationStatsAsync();
        Task<TokenDistributionDto> GetTokenDistributionAsync();
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetVietnameseMonthName(DateTime date)
        {
            var vietnameseMonths = new Dictionary<int, string>
            {
                { 1, "Tháng 1" },
                { 2, "Tháng 2" },
                { 3, "Tháng 3" },
                { 4, "Tháng 4" },
                { 5, "Tháng 5" },
                { 6, "Tháng 6" },
                { 7, "Tháng 7" },
                { 8, "Tháng 8" },
                { 9, "Tháng 9" },
                { 10, "Tháng 10" },
                { 11, "Tháng 11" },
                { 12, "Tháng 12" }
            };
            
            return $"{vietnameseMonths[date.Month]} {date.Year}";
        }

        public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync()
        {
            var overview = await GetOverviewStatisticsAsync();
            var topActivities = await GetTopActivitiesAsync();
            var monthlyStats = await GetMonthlyStatsAsync();
            var classParticipation = await GetClassParticipationStatsAsync();
            var tokenDistribution = await GetTokenDistributionAsync();

            return new DashboardAnalyticsDto
            {
                Overview = overview,
                TopActivities = topActivities,
                MonthlyStats = monthlyStats,
                ClassParticipation = classParticipation,
                TokenDistribution = tokenDistribution
            };
        }

        public async Task<OverviewStatisticsDto> GetOverviewStatisticsAsync()
        {
            var now = DateTime.UtcNow;

            var totalUsers = await _context.Users.CountAsync();
            var totalStudents = await _context.Users.CountAsync(u => u.IsStudent);
            var totalAdmins = await _context.Users.CountAsync(u => !u.IsStudent);

            var totalActivities = await _context.Activities.CountAsync();
            var activeActivities = await _context.Activities
                .CountAsync(a => a.IsActive && a.StartDate <= now && a.EndDate >= now);
            var completedActivities = await _context.Activities
                .CountAsync(a => a.EndDate < now);

            var totalRegistrations = await _context.ActivityRegistrations.CountAsync();
            var confirmedParticipations = await _context.ActivityRegistrations
                .CountAsync(r => r.IsParticipationConfirmed);

            var totalTokensDistributed = await _context.TransactionLogs
                .Where(t => t.TransactionType == "ActivityReward")
                .SumAsync(t => t.Amount);

            var totalTransactions = await _context.TransactionLogs.CountAsync();

            var participationRate = totalRegistrations > 0 
                ? (double)confirmedParticipations / totalRegistrations * 100 
                : 0;

            var averageTokensPerActivity = totalActivities > 0 
                ? (double)totalTokensDistributed / totalActivities 
                : 0;

            return new OverviewStatisticsDto
            {
                TotalUsers = totalUsers,
                TotalStudents = totalStudents,
                TotalAdmins = totalAdmins,
                TotalActivities = totalActivities,
                ActiveActivities = activeActivities,
                CompletedActivities = completedActivities,
                TotalRegistrations = totalRegistrations,
                ConfirmedParticipations = confirmedParticipations,
                TotalTokensDistributed = totalTokensDistributed,
                TotalTransactions = totalTransactions,
                ParticipationRate = Math.Round(participationRate, 2),
                AverageTokensPerActivity = Math.Round(averageTokensPerActivity, 2)
            };
        }

        public async Task<List<ActivityStatDto>> GetTopActivitiesAsync(int limit = 10)
        {
            var activities = await _context.Activities
                .Include(a => a.Registrations)
                .Select(a => new ActivityStatDto
                {
                    ActivityId = a.Id,
                    ActivityName = a.Name,
                    RegistrationCount = a.Registrations.Count(),
                    ParticipantCount = a.Registrations.Count(r => r.IsParticipationConfirmed),
                    RewardCoin = a.RewardCoin,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Status = a.Status,
                    ParticipationRate = a.Registrations.Count() > 0 
                        ? Math.Round((double)a.Registrations.Count(r => r.IsParticipationConfirmed) / a.Registrations.Count() * 100, 2)
                        : 0
                })
                .OrderByDescending(a => a.ParticipantCount)
                .Take(limit)
                .ToListAsync();

            return activities;
        }

        public async Task<List<MonthlyStatsDto>> GetMonthlyStatsAsync(int months = 12)
        {
            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddMonths(-months);

            var monthlyStats = new List<MonthlyStatsDto>();

            for (int i = 0; i < months; i++)
            {
                var currentMonth = startDate.AddMonths(i);
                var nextMonth = currentMonth.AddMonths(1);

                var newUsers = await _context.Users
                    .CountAsync(u => u.LockoutEnd.HasValue && 
                                u.LockoutEnd.Value >= currentMonth && 
                                u.LockoutEnd.Value < nextMonth);

                var activitiesCreated = await _context.Activities
                    .CountAsync(a => a.StartDate >= currentMonth && a.StartDate < nextMonth);

                var totalParticipations = await _context.ActivityRegistrations
                    .CountAsync(r => r.IsParticipationConfirmed && 
                               r.ParticipationConfirmedAt.HasValue &&
                               r.ParticipationConfirmedAt.Value >= currentMonth && 
                               r.ParticipationConfirmedAt.Value < nextMonth);

                var tokensDistributed = await _context.TransactionLogs
                    .Where(t => t.TransactionType == "ActivityReward" &&
                               t.CreatedAt >= currentMonth && 
                               t.CreatedAt < nextMonth)
                    .SumAsync(t => t.Amount);

                monthlyStats.Add(new MonthlyStatsDto
                {
                    Year = currentMonth.Year,
                    Month = currentMonth.Month,
                    MonthName = GetVietnameseMonthName(currentMonth),
                    NewUsers = newUsers,
                    ActivitiesCreated = activitiesCreated,
                    TotalParticipations = totalParticipations,
                    TokensDistributed = tokensDistributed
                });
            }

            return monthlyStats;
        }

        public async Task<List<ClassParticipationDto>> GetClassParticipationStatsAsync()
        {
            var classStats = await _context.Users
                .Where(u => u.IsStudent && !string.IsNullOrEmpty(u.Class))
                .GroupBy(u => u.Class)
                .Select(g => new ClassParticipationDto
                {
                    ClassName = g.Key,
                    StudentCount = g.Count(),
                    TotalParticipations = g.SelectMany(u => u.ActivityRegistrations)
                        .Count(r => r.IsParticipationConfirmed),
                    AverageParticipationsPerStudent = g.Count() > 0 
                        ? Math.Round((decimal)g.SelectMany(u => u.ActivityRegistrations)
                            .Count(r => r.IsParticipationConfirmed) / g.Count(), 2)
                        : 0,
                    TotalTokensEarned = 0 // We'll calculate this separately
                })
                .OrderByDescending(c => c.TotalParticipations)
                .ToListAsync();

            // Calculate total tokens earned for each class separately
            foreach (var classStat in classStats)
            {
                var totalTokens = await _context.TransactionLogs
                    .Where(t => t.TransactionType == "ActivityReward" && 
                                _context.Users.Any(u => u.Id == t.UserId && u.Class == classStat.ClassName && u.IsStudent))
                    .SumAsync(t => t.Amount);
                
                classStat.TotalTokensEarned = totalTokens;
            }

            return classStats;
        }

        public async Task<TokenDistributionDto> GetTokenDistributionAsync()
        {
            var wallets = await _context.Wallets
                .Include(w => w.User)
                .Where(w => w.User.IsStudent)
                .ToListAsync();

            if (!wallets.Any())
            {
                return new TokenDistributionDto
                {
                    TotalTokensInCirculation = 0,
                    AverageTokensPerUser = 0,
                    HighestBalance = 0,
                    LowestBalance = 0,
                    TopEarners = new List<TopEarnerDto>()
                };
            }

            var totalTokens = wallets.Sum(w => w.Balance);
            var averageTokens = totalTokens / wallets.Count;
            var highestBalance = wallets.Max(w => w.Balance);
            var lowestBalance = wallets.Min(w => w.Balance);

            var topEarners = await _context.Users
                .Where(u => u.IsStudent && u.Wallet != null)
                .Include(u => u.Wallet)
                .Include(u => u.ActivityRegistrations)
                .OrderByDescending(u => u.Wallet.Balance)
                .Take(10)
                .Select(u => new TopEarnerDto
                {
                    StudentId = u.Id,
                    StudentName = u.FullName,
                    StudentCode = u.StudentCode,
                    Class = u.Class,
                    TokenBalance = u.Wallet.Balance,
                    ParticipationCount = u.ActivityRegistrations.Count(r => r.IsParticipationConfirmed)
                })
                .ToListAsync();

            return new TokenDistributionDto
            {
                TotalTokensInCirculation = totalTokens,
                AverageTokensPerUser = Math.Round(averageTokens, 2),
                HighestBalance = highestBalance,
                LowestBalance = lowestBalance,
                TopEarners = topEarners
            };
        }
    }
} 