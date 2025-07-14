namespace backend.Models
{
    public class Experience
    {
        public int Id { get; set; }

        public string? Email { get; set; }

        public string? Description { get; set; }

        public string? Name { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
