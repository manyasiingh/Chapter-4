using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;
using System.Text;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // Place a new order
        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] Order order)
        {
            if (order == null)
                return BadRequest("Order data is required.");

            if (string.IsNullOrEmpty(order.Email))
                return BadRequest("Email is required.");

            if (order.Items == null || !order.Items.Any())
                return BadRequest("Order must contain at least one item.");

            // Handle quiz discount usage
            var quizAttempt = await _context.MonthlyQuizAttempts
                .Where(q => q.Email == order.Email && !q.Used)
                .OrderByDescending(q => q.AttemptDate)
                .FirstOrDefaultAsync();

            if (quizAttempt != null)
            {
                order.Discount = quizAttempt.DiscountAmount;
                // DON'T mark quiz as used yet!
            }

            order.Date = DateTime.Now;
            order.DeliveryDate ??= DateTime.Now.AddDays(7);
            order.Status ??= "Placed";

            _context.Orders.Add(order);

            foreach (var item in order.Items)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                if (book == null)
                    return BadRequest($"Book with ID {item.BookId} does not exist.");

                if (book.Quantity < item.Quantity)
                    return BadRequest($"Not enough stock for '{book.Title}'. Only {book.Quantity} left.");

                book.Quantity -= item.Quantity;
            }

            await _context.SaveChangesAsync();

            // Now mark quiz as used *after* successful SaveChanges
            if (quizAttempt != null)
            {
                quizAttempt.Used = true;
                _context.MonthlyQuizAttempts.Update(quizAttempt);
                await _context.SaveChangesAsync();
            }

            if (order.Total >= 1000)
            {
                var couponService = new CouponService(_context);
                await couponService.GenerateNextOrderCoupon(order.Email, order.Total.Value);
            }

            // Mark 50% NEXT50 coupon as used if it was applied
            if (order.Discount > 0)
            {
                var couponToMark = await _context.Coupons.FirstOrDefaultAsync(c =>
                    c.AssignedToEmail == order.Email &&
                    c.DiscountPercentage == 50 &&
                    c.Code.StartsWith("NEXT50") &&
                    !c.IsUsed &&
                    c.ExpiryDate > DateTime.UtcNow);

                if (couponToMark != null)
                {
                    couponToMark.IsUsed = true;
                    if (couponToMark.Stock != null)
                    {
                        couponToMark.Stock.UsedCount += 1;
                    }
                    _context.Coupons.Update(couponToMark);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(order);
        }
        
        // Get all orders for a user
        [HttpGet("user/{email}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByUser(string email)
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .Where(o => o.Email == email)
                .ToListAsync();

            DateTime today = DateTime.Today;
            bool updated = false;

            foreach (var order in orders)
            {
                if (order.DeliveryDate.HasValue &&
                    order.DeliveryDate.Value.Date < today &&
                    order.Status != "Delivered" &&
                    order.Status != "Cancelled" &&
                    order.Status != "Returned")
                {
                    order.Status = "Delivered";
                    updated = true;
                }
            }

            if (updated)
                await _context.SaveChangesAsync();

            return orders;
        }

        // Cancel an order
        [HttpPut("cancel/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId, [FromBody] string email)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return NotFound("Order not found.");
            if (order.Email != email) return Unauthorized("Cannot cancel someone else's order.");
            if (order.Status == "Delivered") return BadRequest("Delivered orders cannot be cancelled.");
            if (order.Status == "Cancelled") return BadRequest("Order is already cancelled.");

            foreach (var item in order.Items)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                if (book != null) book.Quantity += item.Quantity;
            }

            order.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return Ok(order);
        }

        // Return an order
        [HttpPost("return/{orderId}")]
        public async Task<IActionResult> ReturnOrder(int orderId, [FromBody] string reason)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return NotFound("Order not found.");
            if (order.Status != "Delivered") return BadRequest("Only delivered orders can be returned.");
            if (order.DeliveryDate == null || order.DeliveryDate.Value.AddDays(7) < DateTime.UtcNow)
                return BadRequest("Return window has expired.");
            if (order.IsReturned) return BadRequest("Order is already returned.");

            order.Status = "Returned";
            order.IsReturned = true;
            order.ReturnRequestedDate = DateTime.UtcNow;
            order.ReturnReason = reason;

            foreach (var item in order.Items)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                if (book != null) book.Quantity += item.Quantity;
            }

            await _context.SaveChangesAsync();
            return Ok(order);
        }

        // Admin: view all orders
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .ToListAsync();

            return Ok(orders);
        }

        // Admin: update order status
        [HttpPut("admin/orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] JsonElement body)
        {
            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound("Order not found.");

            if (!body.TryGetProperty("newStatus", out var newStatusProp))
                return BadRequest("Missing newStatus field.");

            string? newStatus = newStatusProp.GetString();
            string? returnReason = body.TryGetProperty("returnReason", out var reasonProp)
                ? reasonProp.GetString()
                : null;

            var previousStatus = order.Status;
            if (newStatus == previousStatus) return NoContent();

            // Returned → something else
            if (previousStatus == "Returned" && newStatus != "Returned")
            {
                order.IsReturned = false;
                order.ReturnRequestedDate = null;
                order.ReturnReason = null;

                foreach (var item in order.Items)
                {
                    var book = await _context.Books.FindAsync(item.BookId);
                    if (book != null) book.Quantity -= item.Quantity;
                }
            }
            // Something else → Returned
            else if (newStatus == "Returned" && previousStatus != "Returned")
            {
                if (string.IsNullOrWhiteSpace(returnReason))
                    return BadRequest("Return reason is required when marking as returned.");

                order.IsReturned = true;
                order.ReturnRequestedDate = DateTime.UtcNow;
                order.ReturnReason = returnReason;

                foreach (var item in order.Items)
                {
                    var book = await _context.Books.FindAsync(item.BookId);
                    if (book != null) book.Quantity += item.Quantity;
                }
            }
            // → Cancelled
            else if (newStatus == "Cancelled" && previousStatus != "Cancelled")
            {
                foreach (var item in order.Items)
                {
                    var book = await _context.Books.FindAsync(item.BookId);
                    if (book != null) book.Quantity += item.Quantity;
                }
            }
            // Cancelled → something else
            else if (previousStatus == "Cancelled" && newStatus != "Cancelled")
            {
                foreach (var item in order.Items)
                {
                    var book = await _context.Books.FindAsync(item.BookId);
                    if (book != null) book.Quantity -= item.Quantity;
                }
            }

            order.Status = newStatus;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Get a specific order by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(o => o.Id == id);

            return order == null ? NotFound("Order not found.") : Ok(order);
        }
    }
}