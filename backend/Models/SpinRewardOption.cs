using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class SpinRewardOption
    {
        public int Id { get; set; } // primary key, slice id

        [Required]
        public string RewardType { get; set; } = null!;   // e.g. "DISCOUNT", "POINTS", "FREE_DELIVERY", "CASHBACK"

        [Required]
        public string RewardValue { get; set; } = null!;  // e.g. "5%", "10%", "50", "100", "₹30", "YES"

        public bool IsActive { get; set; } = true;       // admin can disable/enable a slice

        // Optional: ordering if you want wheel ordering control
        public int SortOrder { get; set; } = 0;
    }
}