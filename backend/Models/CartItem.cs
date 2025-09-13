namespace backend.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public string? Email { get; set; } 
        public int BookId { get; set; }
        public int Quantity { get; set; }
        public Book? Book { get; set; }
    }

}
