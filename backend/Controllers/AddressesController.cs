using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AddressesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressesController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/addresses/user/{email}
        [HttpGet("user/{email}")]
        public async Task<ActionResult<IEnumerable<Address>>> GetAddressesByUserEmail(string email)
        {
            var addresses = await _context.Addresses
                                        .Where(a => a.Email == email)
                                        .ToListAsync();

            if (addresses == null || !addresses.Any())
            {
                return NotFound($"No addresses found for user with email {email}");
            }

            return Ok(addresses);
        }

        [HttpPost]
        public async Task<ActionResult<Address>> PostAddress(Address address)
        {
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(PostAddress), new { id = address.Id }, address);
        }
    }
}