namespace backend.Models
{
    public class Address
    {
        public int Id { get; set; }
        public string? Email { get; set; }  
        public string? FullName { get; set; }
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
    }
}