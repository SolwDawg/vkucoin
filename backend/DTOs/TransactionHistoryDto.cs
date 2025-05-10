using System;

namespace backend.DTOs
{
    public class TransactionHistoryRequestDto
    {
        public string UserId { get; set; }
        public string TransactionType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class TransactionDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string StudentCode { get; set; }
        public decimal Amount { get; set; }
        public string TransactionType { get; set; }
        public string Description { get; set; }
        public string TransactionHash { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 