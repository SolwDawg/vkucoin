namespace backend.DTOs
{
    public class MintTokensDto
    {
        public string UserId { get; set; }
        public string Amount { get; set; }
    }
    
    public class CreateBlockchainActivityDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string RewardAmount { get; set; }
    }
    
    public class UpdateBlockchainActivityDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string RewardAmount { get; set; }
        public bool IsActive { get; set; }
    }
    
    public class CompleteActivityDto
    {
        public string UserId { get; set; }
        public string ActivityId { get; set; }
    }
    
    public class BatchCompleteActivityDto
    {
        public string[] UserIds { get; set; }
        public string ActivityId { get; set; }
    }
    
    public class AddStudentRoleDto
    {
        public string UserId { get; set; }
    }
} 