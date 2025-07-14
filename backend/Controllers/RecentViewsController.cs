using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecentViewController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecentViewController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddRecentView([FromBody] RecentView recentView)
        {
            var existing = await _context.RecentViews
                .FirstOrDefaultAsync(rv => rv.Email == recentView.Email && rv.BookId == recentView.BookId);

            if (existing == null)
            {
                _context.RecentViews.Add(recentView);
                await _context.SaveChangesAsync();
            }
            else
            {
                existing.ViewedAt = DateTime.UtcNow;
                _context.RecentViews.Update(existing);
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<IEnumerable<Book>>> GetRecentBooks(string email)
        {
            var recentBooks = await _context.RecentViews
                .Where(rv => rv.Email == email)
                .OrderByDescending(rv => rv.ViewedAt)
                .Take(3)
                .Include(rv => rv.Book)
                .Select(rv => rv.Book)
                .ToListAsync();

            return Ok(recentBooks);
        }
    }
}