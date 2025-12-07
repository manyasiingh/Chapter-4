using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models.Payment;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentController(AppDbContext context)
        {
            _context = context;
        }

        // ------------------------------------------------
        // CREATE PAYMENT ORDER
        // ------------------------------------------------
        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentRequest request)
        {
            if (request == null || request.Amount <= 0)
                return BadRequest("Invalid payment request");

            if (string.IsNullOrEmpty(request.UserEmail))
                return BadRequest("User email is required");

            // Convert decimal to int (rupees to paise if needed)
            // If your frontend sends rupees, multiply by 100 for paise
            // If your frontend already sends correct amount, use as-is
            int amountInPaise = (int)(request.Amount * 100); // Convert rupees to paise
            
            // OR if your frontend already sends the correct amount:
            // int amount = (int)request.Amount;

            // Create fake Razorpay Order Id
            string fakeOrderId = "order_" + Guid.NewGuid().ToString("N");

            var transaction = new PaymentTransaction
            {
                UserEmail = request.UserEmail,
                Amount = amountInPaise, // Use the converted amount
                RazorpayOrderId = fakeOrderId,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.PaymentTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                orderId = fakeOrderId,
                amount = request.Amount, // Return the original amount
                amountInPaise = amountInPaise,
                transactionId = transaction.Id
            });
        }

        // ------------------------------------------------
        // VERIFY PAYMENT AFTER SUCCESS
        // ------------------------------------------------
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] PaymentVerifyRequest request)
        {
            if (request == null)
                return BadRequest("Invalid verification request");

            var transaction = await _context.PaymentTransactions
                .FirstOrDefaultAsync(t => t.RazorpayOrderId == request.RazorpayOrderId);

            if (transaction == null)
                return NotFound("Transaction not found");

            // Fake verification logic: if RazorpayPaymentId exists → success
            if (!string.IsNullOrEmpty(request.RazorpayPaymentId))
            {
                transaction.Status = PaymentStatus.Succeeded;
                transaction.RazorpayPaymentId = request.RazorpayPaymentId;
                transaction.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "Payment verified successfully",
                    transactionId = transaction.Id
                });
            }

            transaction.Status = PaymentStatus.Failed;
            transaction.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { 
                success = false, 
                message = "Payment verification failed" 
            });
        }
    }
}