using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("sales-report")]
        public async Task<IActionResult> GetSalesReport()
        {
            // Combine multiple queries into a single database call
            var allOrders = await _context.Orders.ToListAsync();
            var allOrderItems = await _context.OrderItems.Include(oi => oi.Book).ToListAsync();

            var totalOrders = allOrders.Count;
            var totalRevenue = allOrders.Sum(o => o.Total);
            var totalBooksSold = allOrderItems.Sum(oi => oi.Quantity);

            var topSelling = allOrderItems
                .Where(oi => oi.Book != null)
                .GroupBy(oi => oi.Book!.Title)
                .Select(g => new { Title = g.Key, Count = g.Sum(x => x.Quantity) })
                .OrderByDescending(g => g.Count)
                .FirstOrDefault();

            var leastSelling = allOrderItems
                .Where(oi => oi.Book != null)
                .GroupBy(oi => oi.Book!.Title)
                .Select(g => new { Title = g.Key, Count = g.Sum(x => x.Quantity) })
                .OrderBy(g => g.Count)
                .FirstOrDefault();

            var lastOrder = allOrders
                .OrderByDescending(o => o.Date)
                .FirstOrDefault();

            var placedOrders = allOrders.Count(o => o.Status == "Placed");
            var deliveredOrders = allOrders.Count(o => o.Status == "Delivered");
            var cancelledOrders = allOrders.Count(o => o.Status == "Cancelled");
            var returnedOrders = allOrders.Count(o => o.Status == "Returned");

            return Ok(new
            {
                totalOrders,
                totalRevenue,
                totalBooksSold,
                placedOrders,
                deliveredOrders,
                cancelledOrders,
                returnedOrders,
                topBook = topSelling?.Title ?? "N/A",
                leastBook = leastSelling?.Title ?? "N/A",
                lastOrderDate = lastOrder?.Date ?? DateTime.MinValue
            });
        }
        
        // No changes needed for GetStockReport - it is already optimized.
        [HttpGet("stock-report")]
        public async Task<IActionResult> GetStockReport()
        {
            var stock = await _context.Books
                .Select(book => new
                {
                    book.Id,
                    book.Title,
                    book.Category,
                    book.Quantity,
                    Status = book.Quantity == 0 ? "Out of Stock" :
                             book.Quantity < 5 ? "Low Stock" : "In Stock"
                })
                .ToListAsync();

            return Ok(stock);
        }

        // Refactored to use a single database query
        [HttpGet("earnings-report")]
        public async Task<IActionResult> GetEarningsReport()
        {
            var deliveredOrders = await _context.Orders
                .Where(o => o.Status == "Delivered" && o.DeliveryDate != null)
                .ToListAsync();

            var revenueDelivered = deliveredOrders.Sum(o => o.Total);
            var revenueReturned = await _context.Orders.Where(o => o.Status == "Returned").SumAsync(o => o.Total);
            var revenueCancelled = await _context.Orders.Where(o => o.Status == "Cancelled").SumAsync(o => o.Total);
            var revenuePlaced = await _context.Orders.Where(o => o.Status == "Placed").SumAsync(o => o.Total);
            var revenueAll = revenueDelivered + revenueReturned + revenueCancelled + revenuePlaced;

            var monthlyRevenue = deliveredOrders
                .GroupBy(o => new { o.DeliveryDate!.Value.Year, o.DeliveryDate.Value.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy"),
                    revenue = g.Sum(x => x.Total)
                })
                .ToList();

            return Ok(new
            {
                revenueAll,
                revenueDelivered,
                revenueReturned,
                revenueCancelled,
                revenuePlaced,
                monthlyRevenue
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExperience(int id)
        {
            var experience = await _context.Experiences.FindAsync(id);
            if (experience == null)
                return NotFound();

            _context.Experiences.Remove(experience);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
