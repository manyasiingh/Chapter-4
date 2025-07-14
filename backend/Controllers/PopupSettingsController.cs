using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PopupSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PopupSettingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET all
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StartupPopupSettings>>> GetAll()
        {
            return await _context.StartupPopupSettings.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StartupPopupSettings>> Get(int id)
        {
            var setting = await _context.StartupPopupSettings.FindAsync(id);
            if (setting == null) return NotFound();
            return setting;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StartupPopupSettings updated)
        {
            var setting = await _context.StartupPopupSettings.FindAsync(id);
            if (setting == null) return NotFound();

            setting.IsEnabled = updated.IsEnabled;
            setting.Title = updated.Title;
            setting.Subtitle = updated.Subtitle;
            setting.OfferText = updated.OfferText;
            setting.DeliveryText = updated.DeliveryText;

            await _context.SaveChangesAsync();
            return Ok(setting);
        }

        [HttpPost]
        public async Task<ActionResult<StartupPopupSettings>> Create([FromBody] StartupPopupSettings newSetting)
        {
            _context.StartupPopupSettings.Add(newSetting);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = newSetting.Id }, newSetting);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var setting = await _context.StartupPopupSettings.FindAsync(id);
            if (setting == null) return NotFound();

            _context.StartupPopupSettings.Remove(setting);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}