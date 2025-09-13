using System.Text.Json.Serialization;

namespace backend.Models
{
    public class CouponStock
    {
        public int Id { get; set; }
        public int CouponId { get; set; }
        public Coupon? Coupon { get; set; }
        public int TotalQuantity { get; set; }
        [JsonIgnore]
        public int UsedCount { get; set; }
    }
}