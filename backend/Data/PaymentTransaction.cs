using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Data
{
    public enum PaymentStatus
    {
        Pending = 0,
        Succeeded = 1,
        Failed = 2,
        WebhookConfirmed = 3
    }

    public class PaymentTransaction
    {
        public int Id { get; set; }
        public string? UserEmail { get; set; }
        public int Amount { get; set; }

        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
