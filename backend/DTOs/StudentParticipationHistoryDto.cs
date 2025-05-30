using System;

namespace backend.DTOs
{
    public class StudentParticipationHistoryDto
    {
        public int ActivityId { get; set; }
        public string ActivityName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Location { get; set; }
        public string Organizer { get; set; }
        public int RewardCoin { get; set; }
        public string ImageUrl { get; set; }
        
        // Registration details
        public DateTime RegisteredAt { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public bool IsParticipationConfirmed { get; set; }
        public DateTime? ParticipationConfirmedAt { get; set; }
        public string EvidenceImageUrl { get; set; }
        
        // Calculated fields
        public string Status { get; set; }
        public bool RewardReceived { get; set; }
    }

    public class StudentParticipationHistoryListDto
    {
        public List<StudentParticipationHistoryDto> Participations { get; set; } = new List<StudentParticipationHistoryDto>();
        public int TotalActivities { get; set; }
        public int CompletedActivities { get; set; }
        public int TotalCoinsEarned { get; set; }
    }
} 