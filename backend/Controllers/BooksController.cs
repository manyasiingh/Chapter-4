using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data; 
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        // Get all books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            return await _context.Books.ToListAsync();
        }

        // Get trending books
        [HttpGet("trending")]
        public async Task<ActionResult<IEnumerable<Book>>> GetTrendingBooks()
        {
            try
            {
                return await _context.Books.Where(b => b.IsTrending).ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.ToString());
            }
        }

        // Get book by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound();
            return book;
        }

        // Add a new book
       [HttpPost]
        public async Task<IActionResult> AddBook([FromForm] IFormCollection form, IFormFile? file)
        {
            if (!form.ContainsKey("category") || string.IsNullOrWhiteSpace(form["category"]))
            {
                return BadRequest("Category is required");
            }

            string category = form["category"].ToString();

            Book book;

            switch (category)
            {
                case "Medical":
                    book = new MedicalBook
                    {
                        Subject = form["subject"]
                    };
                    break;
                case "Fiction":
                    book = new FictionBook
                    {
                        Genre = form["genre"]
                    };
                    break;
                case "Educational":
                    book = new EducationalBook
                    {
                        Course = form["course"]
                    };
                    break;
                case "Indian":
                    book = new IndianBook
                    {
                        Language = form["language"]
                    };
                    break;
                default:
                    book = new Book(); // fallback
                    break;
            }

            // Common properties
            book.Title = form["title"];
            book.Author = form["author"];
            book.Price = decimal.TryParse(form["price"], out var p) ? p : 0;
            book.Quantity = int.TryParse(form["quantity"], out var q) ? q : 0;
            book.Description = form["description"];
            book.Category = category;
            book.IsTrending = bool.TryParse(form["isTrending"], out var t) ? t : false;
            book.PageCount = int.TryParse(form["pageCount"], out var pageCount) ? pageCount : 0;
            book.StoryType = form["storyType"];
            book.ThemeType = form["themeType"];

            // Handle image file
            if (file != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                book.CoverImageUrl = "/images/" + fileName;
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        // Update book
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] Book updatedBook, IFormFile? file)
        {
            if (id != updatedBook.Id)
                return BadRequest("Book ID mismatch");

            // Load the correct derived type based on the category
            Book? existing = updatedBook.Category switch
            {
                "Medical" => await _context.Books.OfType<MedicalBook>().FirstOrDefaultAsync(b => b.Id == id),
                "Fiction" => await _context.Books.OfType<FictionBook>().FirstOrDefaultAsync(b => b.Id == id),
                "Educational" => await _context.Books.OfType<EducationalBook>().FirstOrDefaultAsync(b => b.Id == id),
                "Indian" => await _context.Books.OfType<IndianBook>().FirstOrDefaultAsync(b => b.Id == id),
                _ => await _context.Books.FindAsync(id)
            };

            if (existing == null)
                return NotFound();

            if (file != null)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", fileName);

                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                existing.CoverImageUrl = "/images/" + fileName;
            }

            // Common fields
            existing.Title = updatedBook.Title;
            existing.Author = updatedBook.Author;
            existing.Price = updatedBook.Price;
            existing.Quantity = updatedBook.Quantity;
            existing.Category = updatedBook.Category;
            existing.Description = updatedBook.Description;
            existing.IsTrending = updatedBook.IsTrending;
            existing.PageCount = updatedBook.PageCount;
            existing.StoryType = updatedBook.StoryType;
            existing.ThemeType = updatedBook.ThemeType;

            // Category-specific fields
            switch (existing)
            {
                case MedicalBook medical:
                    medical.Subject = Request.Form["subject"];
                    break;
                case FictionBook fiction:
                    fiction.Genre = Request.Form["genre"];
                    break;
                case EducationalBook edu:
                    edu.Course = Request.Form["course"];
                    break;
                case IndianBook indian:
                    indian.Language = Request.Form["language"];
                    break;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Delete book
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Search by title or author
        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks(string query, string filter = "title")
        {
            if (string.IsNullOrEmpty(query)) return BadRequest("Query is required");

            IQueryable<Book> books = _context.Books;

            if (filter.ToLower() == "author")
            {
                books = books.Where(b => b.Author != null && b.Author.ToLower().Contains(query.ToLower()));
            }
            else
            {
                books = books.Where(b => b.Title != null && b.Title.ToLower().Contains(query.ToLower()));
            }

            return Ok(await books.ToListAsync());
        }

        [HttpGet("by-category/{category}")]
        public IActionResult GetBooksByCategory(string category)
        {
            var books = _context.Books
                .Where(b => (b.Category ?? "").ToLower() == category.ToLower())
                .ToList();

            return Ok(books);
        }

        [HttpGet("match")]
        public IActionResult MatchBooks([FromQuery] string genre, [FromQuery] string theme, [FromQuery] string story)
        {
            var books = _context.Books
                .Where(b =>
                    (b.Category ?? "").ToLower().Contains(genre.ToLower()) &&
                    (b.ThemeType ?? "").ToLower().Contains(theme.ToLower()) &&
                    (b.StoryType ?? "").ToLower().Contains(story.ToLower()))
                .ToList();

            return Ok(books);
        }
    }
}