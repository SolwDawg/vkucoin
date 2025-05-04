using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class TransactionLog
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; } // "ActivityReward", "Transfer", etc.
        public string Description { get; set; }
         public string TransactionHash { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}