using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartItemsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/cartitems/{email}
        [HttpGet("{email}")]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCartItems(string email)
        {
            return await _context.CartItems
                .Where(ci => ci.Email == email)
                .Include(ci => ci.Book) // Include book details
                .ToListAsync();
        }

        // POST: api/cartitems
        [HttpPost]
        public async Task<IActionResult> AddCartItem([FromBody] CartItem item)
        {
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Email == item.Email && ci.BookId == item.BookId);

            if (existingItem != null)
            {
                existingItem.Quantity += item.Quantity;
            }
            else
            {
                _context.CartItems.Add(item);
            }

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // PUT: api/cartitems/{id} — update quantity
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCartItem(int id, CartItem updated)
        {
            var item = await _context.CartItems.FindAsync(id);
            if (item == null) return NotFound();

            item.Quantity = updated.Quantity;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Delete one item
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var item = await _context.CartItems.FindAsync(id);
            if (item == null) return NotFound();

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Delete all for a user
        [HttpDelete("clear/{email}")]
        public async Task<IActionResult> ClearCart(string email)
        {
            var items = await _context.CartItems
                .Where(c => c.Email == email)
                .ToListAsync();

            if (!items.Any()) return NotFound();

            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}