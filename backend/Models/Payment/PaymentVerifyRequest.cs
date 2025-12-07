namespace backend.Models.Payment
{
    public class PaymentVerifyRequest
    {
        public string? TransactionId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? RazorpaySignature { get; set; }
    }
}
