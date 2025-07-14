using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SaleEventController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SaleEventController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSales()
        {
            var now = DateTime.UtcNow;

            var activeSales = await _context.BookSaleEvents
                .Where(s => s.StartDate <= now && s.EndDate >= now)
                .ToListAsync();

            return Ok(activeSales); 
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookSaleEvent>>> GetAll()
        {
            var sales = await _context.BookSaleEvents.ToListAsync();
            return Ok(sales); 
        }

        [HttpPost]
        public async Task<ActionResult> Create(BookSaleEvent saleEvent)
        {
            if (saleEvent == null)
                return BadRequest(new { message = "Sale event data is required." });

            _context.BookSaleEvents.Add(saleEvent);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sale created successfully", saleEvent });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, BookSaleEvent updated)
        {
            var existing = await _context.BookSaleEvents.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Title = updated.Title;
            existing.Description = updated.Description;
            existing.DiscountPercentage = updated.DiscountPercentage;
            existing.StartDate = updated.StartDate;
            existing.EndDate = updated.EndDate;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var sale = await _context.BookSaleEvents.FindAsync(id);
            if (sale == null)
                return NotFound(new { message = "Sale event not found." });

            _context.BookSaleEvents.Remove(sale);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sale deleted successfully" });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookSaleEvent>> GetById(int id)
        {
            var sale = await _context.BookSaleEvents.FindAsync(id);
            if (sale == null)
                return NotFound();

            return Ok(sale);
        }
    }
}
