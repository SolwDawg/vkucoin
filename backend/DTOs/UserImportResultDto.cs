using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class UserImportResultDto
    {
         public string StudentCode { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string WalletAddress { get; set; }
        public string Message { get; set; }
    }
}