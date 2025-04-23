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
    }
}