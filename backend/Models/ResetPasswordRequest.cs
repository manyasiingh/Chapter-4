namespace backend.Models
{
    public class ResetPasswordRequest
    {
        public string? Email { get; set; }
        public string? MobileNumber { get; set; }
        public string? NewPassword { get; set; }
    }
}