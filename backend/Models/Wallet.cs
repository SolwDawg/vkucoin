using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Wallet
    {
        public int Id { get; set; }
        public string Address { get; set; }
        public string PrivateKey { get; set; }
        public decimal Balance { get; set; } = 0;
        public string UserId { get; set; }
        
        [JsonIgnore]
        public User User { get; set; }
    }
}