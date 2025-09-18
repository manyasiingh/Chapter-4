using Microsoft.AspNetCore.Mvc;
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
        public IActionResult GetSalesReport()
        {
            var totalOrders = _context.Orders.Count();
            var totalRevenue = _context.Orders.Sum(o => o.Total) ?? 0;
            var totalBooksSold = _context.OrderItems.Sum(oi => oi.Quantity);

            var topSelling = _context.OrderItems
                .Where(oi => oi.Book != null)
                .GroupBy(oi => oi.Book!.Title)
                .Select(g => new { Title = g.Key, Count = g.Sum(x => x.Quantity) })
                .OrderByDescending(g => g.Count)
                .FirstOrDefault();

            var leastSelling = _context.OrderItems
                .Where(oi => oi.Book != null)
                .GroupBy(oi => oi.Book!.Title)
                .Select(g => new { Title = g.Key, Count = g.Sum(x => x.Quantity) })
                .OrderBy(g => g.Count)
                .FirstOrDefault();

            var lastOrder = _context.Orders
                .OrderByDescending(o => o.Date)
                .FirstOrDefault();

            var placedOrders = _context.Orders.Count(o => o.Status == "Placed");
            var deliveredOrders = _context.Orders.Count(o => o.Status == "Delivered");
            var cancelledOrders = _context.Orders.Count(o => o.Status == "Cancelled");
            var returnedOrders = _context.Orders.Count(o => o.Status == "Returned");

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

        [HttpGet("stock-report")]
        public IActionResult GetStockReport()
        {
            var stock = _context.Books
                .Select(book => new
                {
                    book.Id,
                    book.Title,
                    book.Category,
                    book.Quantity,
                    Status = book.Quantity == 0 ? "Out of Stock" :
                             book.Quantity < 5 ? "Low Stock" : "In Stock"
                })
                .ToList();

            return Ok(stock);
        }

        [HttpGet("earnings-report")]
        public IActionResult GetEarningsReport()
        {
            var allOrders = _context.Orders
                .Where(o => o.Total > 0)
                .ToList();

            var revenueAll = allOrders.Sum(o => o.Total);
            var revenueDelivered = allOrders.Where(o => o.Status == "Delivered").Sum(o => o.Total);
            var revenueReturned = allOrders.Where(o => o.Status == "Returned").Sum(o => o.Total);
            var revenueCancelled = allOrders.Where(o => o.Status == "Cancelled").Sum(o => o.Total);
            var revenuePlaced = allOrders.Where(o => o.Status == "Placed").Sum(o => o.Total);

            var monthlyRevenue = allOrders
                .Where(o => o.DeliveryDate != null)
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
