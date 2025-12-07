using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/spin-options")]
public class SpinAdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public SpinAdminController(AppDbContext context)
    {
        _context = context;
    }

    // GET: all options
    [HttpGet]
    public async Task<IActionResult> GetAllOptions()
    {
        var list = await _context.SpinRewardOptions
            .OrderBy(o => o.SortOrder)
            .ToListAsync();

        return Ok(list);
    }

    // POST: add option
    [HttpPost]
    public async Task<IActionResult> AddOption([FromBody] SpinRewardOption option)
    {
        _context.SpinRewardOptions.Add(option);
        await _context.SaveChangesAsync();
        return Ok(option);
    }

    // PUT: update option
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOption(int id, [FromBody] SpinRewardOption option)
    {
        var existing = await _context.SpinRewardOptions.FindAsync(id);
        if (existing == null) return NotFound();

        existing.RewardType = option.RewardType;
        existing.RewardValue = option.RewardValue;
        existing.IsActive = option.IsActive;
        existing.SortOrder = option.SortOrder;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: remove option
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOption(int id)
    {
        var existing = await _context.SpinRewardOptions.FindAsync(id);
        if (existing == null) return NotFound();

        _context.SpinRewardOptions.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok();
    }
}