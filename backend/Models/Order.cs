namespace backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public decimal? Subtotal { get; set; }
        public decimal? Discount { get; set; }
        public decimal? Total { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public List<OrderItem> Items { get; set; } = new();
        public string? Status { get; set; } = "Placed";
        public decimal? Tip { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public bool IsReturned { get; set; } = false;
        public DateTime? ReturnRequestedDate { get; set; }
        public string? ReturnReason { get; set; }
        public decimal ShippingCharge { get; set; }
        public string PaymentMethod { get; set; } = "Cash on Delivery";
    }
}