using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookQuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookQuizController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("recommend")]
        public IActionResult RecommendBooks([FromBody] QuizData quiz)
        {
            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrEmpty(quiz.Genre))
                query = query.Where(b => b.Category != null &&
                                        b.Category.ToLower().Contains(quiz.Genre.ToLower()));

            if (!string.IsNullOrEmpty(quiz.Mood))
            {
                var moodKeyword = quiz.Mood.ToLower() switch
                {
                    "adventurous" => "adventure",
                    "romantic" => "romance",
                    "thoughtful" => "philosophy",
                    "curious" => "facts",
                    _ => ""
                };

                if (!string.IsNullOrEmpty(moodKeyword))
                    query = query.Where(b => b.Description != null &&
                                            b.Description.ToLower().Contains(moodKeyword));
            }

            if (!string.IsNullOrEmpty(quiz.Length))
            {
                query = quiz.Length.ToLower() switch
                {
                    "short" => query.Where(b => b.PageCount <= 200),
                    "medium" => query.Where(b => b.PageCount > 200 && b.PageCount <= 400),
                    "long" => query.Where(b => b.PageCount > 400),
                    _ => query
                };
            }

            if (!string.IsNullOrEmpty(quiz.Style))
            {
                query = query.Where(b => (b.ThemeType ?? "").ToLower().Contains(quiz.Style.ToLower())
                                    || (b.StoryType ?? "").ToLower().Contains(quiz.Style.ToLower()));
            }

            var result = query.Take(5).ToList();
            return Ok(result);
        }
    }
}
