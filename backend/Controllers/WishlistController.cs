using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetWishlist(string email)
        {
            var items = await _context.WishlistItems
                .Include(w => w.Book)
                .Where(w => w.Email == email)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> AddToWishlist([FromBody] WishlistItem item)
        {
            var exists = await _context.WishlistItems
                .AnyAsync(w => w.Email == item.Email && w.BookId == item.BookId);

            if (exists)
                return BadRequest("Book already in wishlist.");

            _context.WishlistItems.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpDelete("{email}/{bookId}")]
        public async Task<IActionResult> RemoveFromWishlist(string email, int bookId)
        {
            var item = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.Email == email && w.BookId == bookId);

            if (item == null)
                return NotFound();

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        //in user profile
        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetWishlistByUser(string email)
        {
            var wishlistItems = await _context.WishlistItems
                .Include(w => w.Book)
                .Where(w => w.Email == email)
                .ToListAsync();

            return Ok(wishlistItems);
        }
    }
}