namespace backend.Models
{
    public class BookSaleEvent
    {
        public int Id { get; set; }

        public string? Title { get; set; }            

        public string? Description { get; set; }     

        public decimal DiscountPercentage { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public List<Book> Books { get; set; } = new(); 
    }
}
