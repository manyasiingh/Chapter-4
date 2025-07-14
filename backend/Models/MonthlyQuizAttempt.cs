namespace backend.Models
{
    public class MonthlyQuizAttempt
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public int Score { get; set; }
        public DateTime AttemptDate { get; set; } = DateTime.UtcNow;
        public bool Used { get; set; } = false;
        public decimal DiscountAmount { get; set; }
        public string? Role { get; set; }
    }
}