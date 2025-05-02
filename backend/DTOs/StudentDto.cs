using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class StudentDto
    {
        public string StudentCode { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Class { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string WalletAddress { get; set; }
        public decimal WalletBalance { get; set; }
        
    }

    
}