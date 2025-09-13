using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExperiencesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExperiencesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Experience>>> GetExperiences()
        {
            return await _context.Experiences
                .OrderByDescending(e => e.SubmittedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> PostExperience(Experience experience)
        {
            if (string.IsNullOrEmpty(experience.Description) || string.IsNullOrEmpty(experience.Name))
                return BadRequest("Invalid data");

            _context.Experiences.Add(experience);
            await _context.SaveChangesAsync();
            return Ok(experience);
        }
    }
}