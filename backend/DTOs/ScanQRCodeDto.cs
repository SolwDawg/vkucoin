using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ScanQRCodeDto
    {
        [Required]
        public string QrCodePayload { get; set; }
    }
} 