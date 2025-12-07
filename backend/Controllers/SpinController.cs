using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

[ApiController]
[Route("api/[controller]")]
public class SpinController : ControllerBase
{
    private readonly AppDbContext _context;

    public SpinController(AppDbContext context)
    {
        _context = context;
    }

    private static readonly List<(string type, string value)> Rewards = new()
    {
        ("DISCOUNT", "5%"),
        ("DISCOUNT", "10%"),
        ("DISCOUNT", "20%"),
        ("POINTS", "50"),
        ("POINTS", "100"),
        ("FREE_DELIVERY", "YES")
    };

    [HttpPost("spin/{email}")]
    public IActionResult SpinAndWin(string email)
    {
        var random = new Random();
        var reward = Rewards[random.Next(Rewards.Count)];

        var rewardObj = new SpinReward
        {
            Email = email,
            RewardType = reward.type,
            RewardValue = reward.value,
        };

        _context.SpinRewards.Add(rewardObj);
        _context.SaveChanges();

        return Ok(rewardObj);
    }

    [HttpGet("unused/{email}")]
    public IActionResult GetUnusedReward(string email)
    {
        var reward = _context.SpinRewards
            .FirstOrDefault(r => r.Email == email && !r.IsUsed);

        return Ok(reward);
    }

    [HttpPost("mark-used/{id}")]
    public IActionResult MarkRewardUsed(int id)
    {
        var reward = _context.SpinRewards.FirstOrDefault(r => r.Id == id);
        if (reward == null) return NotFound();

        reward.IsUsed = true;
        _context.SaveChanges();

        return Ok();
    }

    [HttpGet("my-rewards/{email}")]
    public IActionResult GetAllRewards(string email)
    {
        return Ok(
            _context.SpinRewards
            .Where(r => r.Email == email)
            .OrderByDescending(r => r.EarnedAt)
            .ToList()
        );
    }

    // ======================= ADMIN: GET ALL SPIN REWARDS =======================
    [HttpGet("all")]
    public IActionResult GetAllSpinRewards()
    {
        var rewards = _context.SpinRewards
            .OrderByDescending(r => r.EarnedAt)
            .ToList();

        return Ok(rewards);
    }

    // ======================= ADMIN: SPIN OPTIONS CRUD =======================

    // GET all spin wheel options
    [HttpGet("options")]
    public IActionResult GetSpinOptions()
    {
        var options = _context.SpinRewardOptions
            .OrderBy(o => o.Id)
            .ToList();

        return Ok(options);
    }

    // ADD new spin option
    [HttpPost("options")]
    public IActionResult AddSpinOption([FromBody] SpinRewardOption option)
    {
        if (option == null) return BadRequest("Invalid data");

        _context.SpinRewardOptions.Add(option);
        _context.SaveChanges();

        return Ok(option);
    }

    // UPDATE option
    [HttpPut("options/{id}")]
    public IActionResult UpdateSpinOption(int id, [FromBody] SpinRewardOption option)
    {
        var existing = _context.SpinRewardOptions.FirstOrDefault(o => o.Id == id);
        if (existing == null) return NotFound("Option not found");

        existing.RewardType = option.RewardType;
        existing.RewardValue = option.RewardValue;

        _context.SaveChanges();
        return Ok(existing);
    }

    // DELETE option
    [HttpDelete("options/{id}")]
    public IActionResult DeleteSpinOption(int id)
    {
        var option = _context.SpinRewardOptions.FirstOrDefault(o => o.Id == id);
        if (option == null) return NotFound("Option not found");

        _context.SpinRewardOptions.Remove(option);
        _context.SaveChanges();

        return Ok();
    }
}