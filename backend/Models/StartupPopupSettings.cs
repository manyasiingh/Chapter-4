namespace backend.Models
{
    public class StartupPopupSettings
    {
        public int Id { get; set; }
        public bool IsEnabled { get; set; }
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? OfferText { get; set; }
        public string? DeliveryText { get; set; }
    }
}