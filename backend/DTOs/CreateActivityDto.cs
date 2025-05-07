using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class CreateActivityDto
    {
        [Required] public string Name { get; set; }
        [Required] public string Description { get; set; }
        [Required] public DateTime StartDate { get; set; }
        [Required] public DateTime EndDate { get; set; }
        [Required] public int RewardCoin { get; set; }
        [Required] public int MaxParticipants { get; set; }
        [Required] public string ImageUrl { get; set; }
        [Required] public string Location { get; set; }
        [Required] public bool AutoApprove { get; set; } = false;
        [Required] public string Status => GetStatus();
        [Required] public String Organizer {get; set;} 

        private string GetStatus()
        {
            if (DateTime.UtcNow < StartDate) return "Sắp diễn ra";
            if (DateTime.UtcNow <= EndDate) return "Đang diễn ra";
            return "Đã kết thúc";
        }

    }
}