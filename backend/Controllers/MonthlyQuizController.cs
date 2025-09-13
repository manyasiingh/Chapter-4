using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonthlyQuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MonthlyQuizController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("submit")]
        public IActionResult SubmitQuiz([FromBody] MonthlyQuizAttempt attempt)
        {
            if (string.IsNullOrEmpty(attempt.Email))
                return BadRequest("Email is required.");

            var thisMonth = DateTime.UtcNow.Month;
            var alreadyAttempted = _context.MonthlyQuizAttempts
                .Any(q => q.Email == attempt.Email && q.AttemptDate.Month == thisMonth);

            if (alreadyAttempted)
                return BadRequest("You have already taken this month's quiz.");

            // Compute and save the discount
            int discount = GetDiscountAmount(attempt.Score);

            attempt.DiscountAmount = discount;
            attempt.AttemptDate = DateTime.UtcNow;
            attempt.Used = false;

            _context.MonthlyQuizAttempts.Add(attempt);
            _context.SaveChanges();

            return Ok(new { success = true, discount });
        }

        [HttpGet("history/{email}")]
        public IActionResult GetQuizHistory(string email)
        {
            var history = _context.MonthlyQuizAttempts
                .Where(q => q.Email == email)
                .OrderByDescending(q => q.AttemptDate)
                .ToList();

            return Ok(history);
        }

        [HttpGet("reward/{email}")]
        public IActionResult GetAvailableReward(string email)
        {
            var reward = _context.MonthlyQuizAttempts
                .Where(q => q.Email == email && !q.Used)
                .OrderByDescending(q => q.AttemptDate)
                .FirstOrDefault();

            if (reward == null)
                return Ok(new { hasReward = false, discount=0 });

            return Ok(new
            {
                hasReward = true,
                discount = reward.DiscountAmount
            });
        }

        [HttpPost("consume-reward/{email}")]
        public IActionResult ConsumeReward(string email)
        {
            var reward = _context.MonthlyQuizAttempts
                .Where(q => q.Email == email && !q.Used)
                .OrderByDescending(q => q.AttemptDate)
                .FirstOrDefault();

            if (reward == null)
                return BadRequest("No quiz reward to consume.");

            reward.Used = true;
            _context.SaveChanges();

            return Ok(new { success = true });
        }

        private int GetDiscountAmount(int score)
        {
            if (score >= 4) return 100;
            if (score >= 3) return 50;
            if (score >= 2) return 25;
            return 0;
        }

        [HttpGet("all")]
        public IActionResult GetAllQuizAttempts()
        {
            var allAttempts = _context.MonthlyQuizAttempts
                .OrderByDescending(a => a.AttemptDate)
                .ToList();
            return Ok(allAttempts);
        }
    }
}