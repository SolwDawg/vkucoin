using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class UpdateActivityDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? RewardCoin { get; set; }
        public int? MaxParticipants { get; set; }
        public string? ImageUrl {get; set;}
        public string? Location {get;set;}
        public bool? AutoApprove {get; set;}
        
        public string? Status {get; set;}
        public string? Organizer {get;set;}
    }
}