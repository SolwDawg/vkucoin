using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Wallet
    {
        public int Id { get; set; }
        
        [MaxLength(42)]
        public string Address { get; set; }
        
        [MaxLength(70)] // Increase from 64 to 70 to accommodate the full private key with 0x prefix
        public string PrivateKey { get; set; }
        
        public decimal Balance { get; set; } = 0;
        public string UserId { get; set; }
        
        [JsonIgnore]
        public User User { get; set; }
    }
}