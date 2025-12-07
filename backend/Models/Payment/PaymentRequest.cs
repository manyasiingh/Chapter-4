using System;

namespace backend.Models.Payment
{
    public class PaymentRequest
    {
        // Amount in rupees (we convert to paise server-side)
        public decimal Amount { get; set; } 
        public string? UserEmail { get; set; }
        public string Currency { get; set; } = "INR";
        public string Receipt { get; set; } = Guid.NewGuid().ToString();
        public string? Notes { get; set; }
    }
}
