using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutContentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AboutContentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contents = await _context.AboutContents.ToListAsync();
            return Ok(contents);
        }

        [HttpPost]
        public async Task<IActionResult> Add(AboutContent content)
        {
            _context.AboutContents.Add(content);
            await _context.SaveChangesAsync();
            return Ok(content);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AboutContent updatedContent)
        {
            // Find the existing entity by its primary key
            var existing = await _context.AboutContents.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            // Update specific properties
            existing.Content = updatedContent.Content;
            
            // Check if the Section property is also part of the update
            if (updatedContent.Section != null)
            {
                existing.Section = updatedContent.Section;
            }

            await _context.SaveChangesAsync();
            return NoContent(); // Use NoContent for a successful PUT update
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var content = await _context.AboutContents.FindAsync(id);
            if (content == null)
            {
                return NotFound();
            }

            _context.AboutContents.Remove(content);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}