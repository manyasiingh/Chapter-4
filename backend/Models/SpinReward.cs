using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class SpinReward
    {
        public int Id { get; set; }

        [Required]
        public string? Email { get; set; }

        public string? RewardType { get; set; }   // "DISCOUNT", "POINTS", etc.
        public string? RewardValue { get; set; }  // "5%", "50", "FREE"

        public bool IsUsed { get; set; } = false;

        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
    }
}
