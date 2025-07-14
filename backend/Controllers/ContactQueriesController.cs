// using backend.Data;
// using backend.Models;
// using Microsoft.AspNetCore.Mvc;

// namespace backend.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class ContactQueriesController : ControllerBase
//     {
//         private readonly AppDbContext _db;

//         public ContactQueriesController(AppDbContext db)
//         {
//             _db = db;
//         }

//         [HttpPost]
//         public async Task<IActionResult> SubmitQuery(ContactQuery query)
//         {
//             if (!ModelState.IsValid)
//             {
//                 return BadRequest(ModelState);
//             }

//             query.SubmittedAt = DateTime.UtcNow;
//             _db.ContactQueries.Add(query);
//             await _db.SaveChangesAsync();

//             return Ok(new { message = "Query submitted successfully" });
//         }

//         [HttpGet]
//         public async Task<ActionResult<IEnumerable<ContactQuery>>> GetQueries()
//         {
//             return await _context.ContactQueries
//                 .OrderByDescending(q => q.SubmittedAt)
//                 .ToListAsync();
//         }

//         [HttpDelete("{id}")]
//         public async Task<IActionResult> DeleteQuery(int id)
//         {
//             var query = await _context.ContactQueries.FindAsync(id);
//             if (query == null) return NotFound();

//             _context.ContactQueries.Remove(query);
//             await _context.SaveChangesAsync();

//             return NoContent();
//         }
//     }
// }



using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactQueriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ContactQueriesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitQuery(ContactQuery query)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            query.SubmittedAt = DateTime.UtcNow;
            _db.ContactQueries.Add(query);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Query submitted successfully" });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactQuery>>> GetQueries()
        {
            return await _db.ContactQueries
                .OrderByDescending(q => q.SubmittedAt)
                .ToListAsync();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuery(int id)
        {
            var query = await _db.ContactQueries.FindAsync(id);
            if (query == null) return NotFound();

            _db.ContactQueries.Remove(query);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/reply")]
        public async Task<IActionResult> AddReply(int id, [FromBody] string replyText)
        {
            var query = await _db.ContactQueries.FindAsync(id);
            if (query == null) return NotFound();

            query.ReplyText = replyText;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Reply saved successfully." });
        }

        [HttpGet("user/{email}")]
        public async Task<ActionResult<IEnumerable<ContactQuery>>> GetUserQueries(string email)
        {
            return await _db.ContactQueries
                .Where(q => q.Email == email)
                .OrderByDescending(q => q.SubmittedAt)
                .ToListAsync();
        }
    }
}
