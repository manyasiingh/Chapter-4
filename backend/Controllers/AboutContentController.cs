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

        [HttpPut("{section}")]
        public async Task<IActionResult> Update(string section, [FromBody] AboutContent updatedContent)
        {
            var existing = await _context.AboutContents.FirstOrDefaultAsync(a => a.Section == section);
            if (existing == null) return NotFound();

            existing.Content = updatedContent.Content;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }
    }
}