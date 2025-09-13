namespace backend.Models
{
    public class WishlistItem
    {
        public int Id { get; set; }
        public string? Email { get; set; } 
        public int BookId { get; set; }

        public Book? Book { get; set; }
    }
}