using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactInfoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactInfoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ContactInfo>> Get()
        {
            var info = await _context.ContactInfos.FirstOrDefaultAsync();
            if (info == null) return NotFound();
            return info;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ContactInfo updated)
        {
            var existing = await _context.ContactInfos.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Address = updated.Address;
            existing.Email = updated.Email;
            existing.Phone = updated.Phone;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }
    }
}