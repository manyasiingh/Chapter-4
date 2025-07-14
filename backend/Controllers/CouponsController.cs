using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CouponsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("apply")]
        public async Task<IActionResult> ApplyCoupon(string code, [FromQuery] decimal totalAmount, [FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest("Coupon code is required.");

            var coupon = await _context.Coupons
                .Include(c => c.Stock)
                .FirstOrDefaultAsync(c => c.Code == code);

            if (coupon == null)
                return BadRequest("Invalid coupon.");

            if (coupon.ExpiryDate < DateTime.UtcNow)
            {
                if (coupon.IsActive)
                {
                    coupon.IsActive = false;
                    await _context.SaveChangesAsync();
                }
                return BadRequest("Coupon has expired.");
            }

            if (!coupon.IsActive)
                return BadRequest("Coupon is not active.");

            if (!string.IsNullOrEmpty(coupon.AssignedToEmail) &&
                !coupon.AssignedToEmail.Equals(email, StringComparison.OrdinalIgnoreCase))
                return BadRequest("This coupon is not assigned to your account.");

            if (coupon.FirstOrderOnly)
            {
                var hasOrdered = await _context.Orders.AnyAsync(o => o.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
                if (hasOrdered)
                    return BadRequest("This coupon is only valid for first-time orders.");
            }

            if (coupon.MinimumOrderAmount > 0 && totalAmount < coupon.MinimumOrderAmount)
            {
                return Ok(new
                {
                    discountAmount = 0,
                    message = $"Coupon '{coupon.Code}' requires minimum order of ₹{coupon.MinimumOrderAmount}"
                });
            }

            if (coupon.Stock != null && coupon.Stock.TotalQuantity > 0 && coupon.Stock.UsedCount >= coupon.Stock.TotalQuantity)
            // if (coupon.Stock.TotalQuantity > 0 && coupon.Stock.UsedCount >= coupon.Stock.TotalQuantity)
            {
                coupon.IsActive = false;
                await _context.SaveChangesAsync();
                return BadRequest("This coupon has reached its usage limit.");
            }

            if (coupon.Stock != null && coupon.Stock.TotalQuantity > 0 &&
                coupon.Stock.UsedCount >= coupon.Stock.TotalQuantity)
            {
                coupon.IsActive = false;
                await _context.SaveChangesAsync();
                return BadRequest("This coupon has reached its usage limit.");
            }

            if (coupon.Stock != null)
            {
                coupon.Stock.UsedCount += 1;
                _context.CouponStocks.Update(coupon.Stock);
                await _context.SaveChangesAsync();
            }

            decimal discountAmount = coupon.DiscountPercentage.HasValue
                ? Math.Round(totalAmount * coupon.DiscountPercentage.Value / 100, 2)
                : coupon.DiscountAmount ?? 0;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                discountAmount,
                couponType = coupon.DiscountPercentage.HasValue ? "percentage" : "fixed"
            });
        }

        [HttpGet("my-valid/{email}")]
        public async Task<IActionResult> GetValidCoupons(string email)
        {
            try
            {
                var now = DateTime.UtcNow;
                var hasOrdered = await _context.Orders.AnyAsync(o => o.Email == email);

                var coupons = await _context.Coupons
                    .Include(c => c.Stock)
                    .Where(c =>
                        c.ExpiryDate > now &&
                        (!c.FirstOrderOnly || !hasOrdered) &&
                        (
                            (!string.IsNullOrEmpty(c.AssignedToEmail) &&
                            c.AssignedToEmail.ToLower() == email.ToLower() &&
                            !c.IsUsed) ||  
                            (string.IsNullOrEmpty(c.AssignedToEmail) &&
                            c.IsActive &&
                            (c.Stock == null || c.Stock.UsedCount < c.Stock.TotalQuantity)) 
                        )
                    ) 
                    .Select(c => new
                    {
                        c.Code,
                        c.DiscountPercentage,
                        c.DiscountAmount,
                        c.MinimumOrderAmount,
                        c.ExpiryDate,
                        c.AssignedToEmail,
                        TotalQuantity = c.Stock != null ? c.Stock.TotalQuantity : 0,
                        UsedCount = c.Stock != null ? c.Stock.UsedCount : 0,
                        c.IsUsed
                    })
                    .ToListAsync();

                return Ok(coupons);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in GetValidCoupons: " + ex.Message);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveCoupons()
        {
            var now = DateTime.UtcNow;
            var coupons = await _context.Coupons
                .Where(c => c.IsActive && c.ExpiryDate > now)
                .ToListAsync();

            return Ok(coupons);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCoupons()
        {
            var coupons = await _context.Coupons
                .Include(c => c.Stock)
                .Select(c => new
                {
                    c.Id,
                    c.Code,
                    c.DiscountAmount,
                    c.DiscountPercentage,
                    c.MinimumOrderAmount,
                    c.ExpiryDate,
                    c.IsActive,
                    c.IsUsed,
                    c.AssignedToEmail,
                    c.FirstOrderOnly,
                    Stock = c.Stock != null
                        ? new {
                            c.Stock.TotalQuantity,
                            c.Stock.UsedCount
                        }
                        : null
                })
                .ToListAsync();

            return Ok(coupons);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCoupon(int id)
        {
            var coupon = await _context.Coupons
                .Include(c => c.Stock)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (coupon == null)
                return NotFound();

            return Ok(new
            {
                coupon.Id,
                coupon.Code,
                coupon.DiscountAmount,
                coupon.DiscountPercentage,
                coupon.MinimumOrderAmount,
                coupon.ExpiryDate,
                coupon.IsActive,
                coupon.AssignedToEmail,
                coupon.FirstOrderOnly,
                IsUsed = coupon.IsUsed,
                Stock = coupon.Stock != null
                    ? new {
                        coupon.Stock.TotalQuantity,
                        coupon.Stock.UsedCount
                    }
                    : null
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateCoupon([FromBody] Coupon coupon)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            coupon.Id = 0;

            if (coupon.Stock == null)
            {
                return BadRequest("Stock data is required including TotalQuantity.");
            }

            // Always reset UsedCount
            coupon.Stock.UsedCount = 0;

            await _context.Coupons.AddAsync(coupon);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Coupon created successfully" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCoupon(int id, [FromBody] Coupon updatedCoupon)
        {
            if (id != updatedCoupon.Id)
                return BadRequest("ID mismatch");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _context.Coupons
                .Include(c => c.Stock)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existing == null)
                return NotFound();

            existing.Code = updatedCoupon.Code;
            existing.DiscountAmount = updatedCoupon.DiscountAmount;
            existing.DiscountPercentage = updatedCoupon.DiscountPercentage;
            existing.MinimumOrderAmount = updatedCoupon.MinimumOrderAmount;
            existing.ExpiryDate = updatedCoupon.ExpiryDate;
            existing.IsActive = updatedCoupon.IsActive;
            existing.AssignedToEmail = updatedCoupon.AssignedToEmail;
            existing.FirstOrderOnly = updatedCoupon.FirstOrderOnly;
            existing.IsUsed = updatedCoupon.IsUsed;

            if (updatedCoupon.Stock != null)
            {
                if (existing.Stock != null)
                {
                    existing.Stock.TotalQuantity = updatedCoupon.Stock.TotalQuantity;
                }
                else
                {
                    existing.Stock = new CouponStock
                    {
                        CouponId = existing.Id,
                        TotalQuantity = updatedCoupon.Stock.TotalQuantity,
                        UsedCount = 0
                        // CouponId = id
                    };
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = "Coupon updated successfully",
                existing.Id,
                existing.Code
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                return NotFound();

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetCouponsForUser(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required");

            var coupons = await _context.Coupons
                .Where(c => string.IsNullOrEmpty(c.AssignedToEmail) ||
                           c.AssignedToEmail.Equals(email, StringComparison.OrdinalIgnoreCase))
                .ToListAsync();

            return Ok(coupons);
        }

        [HttpGet("top-customer")]
        public async Task<IActionResult> GetTopCustomer()
        {
            var topCustomer = await _context.Orders
                .GroupBy(o => o.Email)
                .Select(g => new
                {
                    Email = g.Key,
                    OrderCount = g.Count()
                })
                .OrderByDescending(x => x.OrderCount)
                .FirstOrDefaultAsync();

            if (topCustomer == null)
                return NotFound("No orders found.");

            return Ok(topCustomer);
        }
    }
}