using System;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CouponService
    {
        private readonly AppDbContext _context;

        public CouponService(AppDbContext context)
        {
            _context = context;
        }

        public async Task GenerateNextOrderCoupon(string email, decimal orderTotal)
        {
            if (orderTotal >= 1000)
            {
                var existingCoupon = await _context.Coupons
                    .FirstOrDefaultAsync(c => c.AssignedToEmail == email && 
                                           c.DiscountPercentage == 50 && 
                                           !c.IsUsed && 
                                           c.ExpiryDate > DateTime.UtcNow);

                if (existingCoupon == null)
                {
                    var coupon = new Coupon
                    {
                        Code = GenerateUniqueCouponCode(email),
                        DiscountPercentage = 50,
                        MinimumOrderAmount = 0,
                        ExpiryDate = DateTime.UtcNow.AddDays(7),
                        AssignedToEmail = email,
                        IsActive = true,
                        IsUsed = false,
                        FirstOrderOnly = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _context.Coupons.AddAsync(coupon);
                    await _context.SaveChangesAsync();
                }
            }
        }

        private string GenerateUniqueCouponCode(string email)
        {
            string baseCode = "NEXT50";
            string uniquePart = Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
            return $"{baseCode}-{uniquePart}";
        }
    }
}