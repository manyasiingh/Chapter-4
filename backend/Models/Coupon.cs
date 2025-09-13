using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using backend.Models;

namespace backend.Models
{
    public class Coupon
    {
        public int Id { get; set; }
        [Required]
        public string? Code { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Discount amount must be non-negative")]
        public int? DiscountAmount { get; set; }
        [Range(0, 100, ErrorMessage = "Discount percentage must be between 0 and 100")]
        public int? DiscountPercentage { get; set; }
        public bool IsActive { get; set; } = true;
        public decimal? MinimumOrderAmount { get; set; }
        [Required]
        public DateTime? ExpiryDate { get; set; }
        public string? AssignedToEmail { get; set; }
        public bool FirstOrderOnly { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public CouponStock? Stock { get; set; }
    }
}
