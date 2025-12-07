using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

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

        // ---------------------- SEARCH BY IMAGE ----------------------
        [HttpPost("search-by-image")]
        public async Task<IActionResult> SearchByImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("Image is required");

            // Save uploaded image to temp
            string tempPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + Path.GetExtension(image.FileName));
            using (var stream = new FileStream(tempPath, FileMode.Create))
                await image.CopyToAsync(stream);

            // Compute hash of uploaded image
            ulong uploadedHash = ComputeImageHash(tempPath);

            var books = await _context.Books.ToListAsync();
            List<Book> matchedBooks = new List<Book>();

            foreach (var book in books)
            {
                if (string.IsNullOrWhiteSpace(book.CoverImageUrl))
                    continue;

                string fullImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", book.CoverImageUrl.TrimStart('/'));

                if (!System.IO.File.Exists(fullImagePath))
                    continue;

                ulong bookHash = ComputeImageHash(fullImagePath);

                int hamming = HammingDistance(uploadedHash, bookHash);

                // match accuracy threshold
                if (hamming <= 10)
                {
                    matchedBooks.Add(book);
                }
            }

            // Return array of books (React expects this)
            return Ok(matchedBooks);
        }

        // ---------------- IMAGE HASHING (pHash using ImageSharp) ----------------

        // ---------------- REAL DCT pHash (best accuracy) ----------------

        private static ulong ComputeImageHash(string imagePath)
        {
            using (var image = Image.Load<Rgba32>(imagePath))
            {
                // Step 1: resize to 32x32
                image.Mutate(x => x.Resize(32, 32));

                double[,] gray = new double[32, 32];

                // Step 2: convert to grayscale
                for (int y = 0; y < 32; y++)
                {
                    for (int x = 0; x < 32; x++)
                    {
                        var p = image[x, y];
                        gray[x, y] = (p.R + p.G + p.B) / 3.0;
                    }
                }

                // Step 3: DCT transform
                double[,] dct = DCT2D(gray);

                // Step 4: take top-left 8×8 block (low frequencies)
                double[] values = new double[64];
                int index = 0;
                for (int y = 0; y < 8; y++)
                {
                    for (int x = 0; x < 8; x++)
                    {
                        values[index++] = dct[x, y];
                    }
                }

                // Step 5: compute median of the 64 DCT values
                double median = values.OrderBy(v => v).ElementAt(32);

                // Step 6: generate 64-bit hash
                ulong hash = 0;
                for (int i = 0; i < 64; i++)
                {
                    if (values[i] > median)
                        hash |= (1UL << i);
                }

                return hash;
            }
        }

        private static double[,] DCT2D(double[,] matrix)
        {
            int N = 32;
            double[,] result = new double[N, N];

            for (int u = 0; u < N; u++)
            {
                for (int v = 0; v < N; v++)
                {
                    double sum = 0.0;

                    for (int x = 0; x < N; x++)
                    {
                        for (int y = 0; y < N; y++)
                        {
                            sum += matrix[x, y] *
                                   Math.Cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
                                   Math.Cos(((2 * y + 1) * v * Math.PI) / (2 * N));
                        }
                    }

                    double cu = (u == 0) ? 1 / Math.Sqrt(2) : 1;
                    double cv = (v == 0) ? 1 / Math.Sqrt(2) : 1;
                    result[u, v] = 0.25 * cu * cv * sum;
                }
            }

            return result;
        }


        private static int HammingDistance(ulong a, ulong b)
        {
            ulong x = a ^ b;
            int count = 0;

            while (x != 0)
            {
                count += (int)(x & 1);
                x >>= 1;
            }

            return count;
        }
    }
}