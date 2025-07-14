namespace backend.Models
{
    public class FaqQuestion
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? QuestionText { get; set; }
        public DateTime AskedAt { get; set; } = DateTime.UtcNow;
        public int HelpfulCount { get; set; } = 0;
        public int NotHelpfulCount { get; set; } = 0;
        public string? AnswerText { get; set; }
        public DateTime? AnsweredAt { get; set; }
    }
}
