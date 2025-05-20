using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class User : IdentityUser
    {
        public string FullName { get; set; }
        public string? StudentCode { get; set; }
        public string? Class { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Role { get; set; }
        public bool IsStudent { get; set; }
        public int TrainingPoints { get; set; }
        
        [JsonIgnore]
        public virtual Wallet Wallet { get; set; }
        public ICollection<ActivityRegistration> ActivityRegistrations { get; set; }
    }
}