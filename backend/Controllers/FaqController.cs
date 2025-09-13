using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaqController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FaqController(AppDbContext context) => _context = context;

        [HttpPost("ask")]
        public async Task<IActionResult> AskQuestion([FromBody] FaqQuestion question)
        {
            _context.FaqQuestions.Add(question);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Question submitted successfully!" });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetQuestions()
        {
            var questions = await _context.FaqQuestions
                .OrderByDescending(q => q.AskedAt)
                .ToListAsync();
            return Ok(questions);
        }

        [HttpPut("{id}/vote")]
        public async Task<IActionResult> VoteOnQuestion(int id, [FromBody] bool isHelpful)
        {
            var question = await _context.FaqQuestions.FindAsync(id);
            if (question == null)
            {
                return NotFound();
            }

            if (isHelpful)
            {
                question.HelpfulCount++;
            }
            else
            {
                question.NotHelpfulCount++;
            }

            await _context.SaveChangesAsync();
            return Ok(question);
        }

        [HttpPut("{id}/answer")]
        public async Task<IActionResult> AnswerQuestion(int id, [FromBody] string answer)
        {
            var question = await _context.FaqQuestions.FindAsync(id);
            if (question == null)
                return NotFound();

            question.AnswerText = answer;
            question.AnsweredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Answer saved successfully!" });
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.FaqQuestions.FindAsync(id);
            if (question == null)
                return NotFound();

            _context.FaqQuestions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
