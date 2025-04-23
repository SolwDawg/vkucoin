using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class ConfirmParticipationDto
    {
        [Required]
        public int ActivityId { get; set; }
        [Required]
        public string StudentCode { get; set; }
        public string EvidenceImageUrl { get; set; }
    }
}