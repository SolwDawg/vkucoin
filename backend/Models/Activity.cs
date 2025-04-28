using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Activity
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Range(1, 1000)]
        public int RewardCoin { get; set; }

        [Required]
        public int MaxParticipants { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public string ImageUrl { get; set; } // URL ảnh đại diện hoạt động

        [Required]
        public string Location { get; set; }

        public string Organizer { get; set; }

        // Thêm các property mới
        public string? AllowedClasses { get; set; } // Format: "CNTT1,CNTT2,KTPM"
        public bool AutoApprove { get; set; } = false;
        public string Status => GetStatus();

        // Danh sách sinh viên đăng ký
        public ICollection<ActivityRegistration> Registrations { get; set; }

        private string GetStatus()
        {
            if (DateTime.UtcNow < StartDate) return "Sắp diễn ra";
            if (DateTime.UtcNow <= EndDate) return "Đang diễn ra";
            return "Đã kết thúc";
        }
    }



    public class ActivityRegistration
    {
        public int Id { get; set; }

        [Required]
        public string StudentId { get; set; }
        public User Student { get; set; }

        [Required]
        public int ActivityId { get; set; }
        public Activity Activity { get; set; }

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; } = false;
        public DateTime? ApprovedAt { get; set; }

        public string? EvidenceImageUrl { get; set; } // URL ảnh minh chứng tham gia

    }
}
