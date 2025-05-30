using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class DashboardAnalyticsDto
    {
        public OverviewStatisticsDto Overview { get; set; }
        public List<ActivityStatDto> TopActivities { get; set; }
        public List<MonthlyStatsDto> MonthlyStats { get; set; }
        public List<ClassParticipationDto> ClassParticipation { get; set; }
        public TokenDistributionDto TokenDistribution { get; set; }
    }

    public class OverviewStatisticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalAdmins { get; set; }
        public int TotalActivities { get; set; }
        public int ActiveActivities { get; set; }
        public int CompletedActivities { get; set; }
        public int TotalRegistrations { get; set; }
        public int ConfirmedParticipations { get; set; }
        public decimal TotalTokensDistributed { get; set; }
        public int TotalTransactions { get; set; }
        public double ParticipationRate { get; set; }
        public double AverageTokensPerActivity { get; set; }
    }

    public class ActivityStatDto
    {
        public int ActivityId { get; set; }
        public string ActivityName { get; set; }
        public int RegistrationCount { get; set; }
        public int ParticipantCount { get; set; }
        public int RewardCoin { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public double ParticipationRate { get; set; }
    }

    public class MonthlyStatsDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; }
        public int NewUsers { get; set; }
        public int ActivitiesCreated { get; set; }
        public int TotalParticipations { get; set; }
        public decimal TokensDistributed { get; set; }
    }

    public class ClassParticipationDto
    {
        public string ClassName { get; set; }
        public int StudentCount { get; set; }
        public int TotalParticipations { get; set; }
        public decimal AverageParticipationsPerStudent { get; set; }
        public decimal TotalTokensEarned { get; set; }
    }

    public class TokenDistributionDto
    {
        public decimal TotalTokensInCirculation { get; set; }
        public decimal AverageTokensPerUser { get; set; }
        public decimal HighestBalance { get; set; }
        public decimal LowestBalance { get; set; }
        public List<TopEarnerDto> TopEarners { get; set; }
    }

    public class TopEarnerDto
    {
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string StudentCode { get; set; }
        public string Class { get; set; }
        public decimal TokenBalance { get; set; }
        public int ParticipationCount { get; set; }
    }
} 