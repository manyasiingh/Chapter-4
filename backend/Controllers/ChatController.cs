using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetMessages(string email)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.SenderEmail == email || m.ReceiverEmail == email)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        {
            message.SentAt = DateTime.UtcNow;
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();

            string lowerMsg = message.Message?.ToLower() ?? string.Empty;
            string? autoReply = null;

            if (lowerMsg.Contains("fiction"))
            {
                autoReply = "Here are some popular fiction books:\n- 1984\n- 1984\n- 1984";
            }
            else if (lowerMsg.Contains("how to add experience"))
            {
                autoReply = "To add experience:\n1. Go to Footer\n2. Click 'User Experience'\n3. Fill the form and save.";
            }
            else if (lowerMsg.Contains("how to return order"))
            {
                autoReply = "To return an order:\n1. Go to Order History\n2. Click 'Return' next to your order\n";
            }

            if (autoReply != null)
            {
                var reply = new ChatMessage
                {
                    SenderEmail = "kavya@gmail.com",
                    ReceiverEmail = message.SenderEmail,
                    Message = autoReply,
                    SentAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(reply);
                await _context.SaveChangesAsync();
            }

            return Ok(message);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetChatUsers()
        {
            var users = await _context.ChatMessages
                .Where(m => m.SenderEmail != "kavya@gmail.com" && m.ReceiverEmail == "kavya@gmail.com"
                         || m.ReceiverEmail != "kavya@gmail.com" && m.SenderEmail == "kavya@gmail.com")
                .Select(m => m.SenderEmail == "kavya@gmail.com" ? m.ReceiverEmail : m.SenderEmail)
                .Distinct()
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("admin/{userEmail}")]
        public async Task<IActionResult> GetAdminConversation(string userEmail)
        {
            var messages = await _context.ChatMessages
                .Where(m =>
                    (m.SenderEmail == userEmail && m.ReceiverEmail == "kavya@gmail.com") ||
                    (m.SenderEmail == "kavya@gmail.com" && m.ReceiverEmail == userEmail)
                )
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }
    }
}