namespace backend.Models
{
   public class RecentView
    {
        public int Id { get; set; }
        public string? Email { get; set; }
        public int BookId { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
        public Book? Book { get; set; }
    }
}