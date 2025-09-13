using System.Text.Json.Serialization;

namespace backend.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int Quantity { get; set; }
        public decimal? Price { get; set; }
        public int OrderId { get; set; }
        public Book? Book { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }
    }
}