namespace backend.Models
{
    public class ContactQuery
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string MobileNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string QueryText { get; set; } = null!;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public string? ReplyText { get; set; }
    }
}