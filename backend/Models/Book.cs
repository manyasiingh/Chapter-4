using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [JsonConverter(typeof(BookJsonConverter))]
    public class Book
    {
        public int Id { get; set; }

        [Required]
        public string? Title { get; set; }

        public string? Author { get; set; }

        public decimal? Price { get; set; }

        public string? CoverImageUrl { get; set; }

        public bool IsTrending { get; set; }

        public int Quantity { get; set; }

        public string? Description { get; set; }

        public string? Category { get; set; }

        public int PageCount { get; set; }

        public string? StoryType { get; set; }

        public string? ThemeType { get; set; }
    }

    public class MedicalBook : Book
    {
        public string? Subject { get; set; }
    }

    public class FictionBook : Book
    {
        public string? Genre { get; set; }
    }

    public class EducationalBook : Book
    {
        public string? Course { get; set; }
    }

    public class IndianBook : Book
    {
        public string? Language { get; set; }  
    }
}