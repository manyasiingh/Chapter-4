using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Threading.Tasks;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using backend.Services;
using System.IO;

namespace backend.Controllers
{
    // DTOs (Data Transfer Objects)
    // These are used to control the data sent to and from the API
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class SignupRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? MobileNumber { get; set; }
    }
    
    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;
        private readonly IPasswordHasherService _passwordHasher;

        public UsersController(AppDbContext context, IConfiguration configuration, IPasswordHasherService passwordHasher)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }

        // ----------------------- PUBLIC ENDPOINTS -----------------------

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignupRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return Conflict("A user with this email already exists.");
            }

            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                MobileNumber = request.MobileNumber,
                Password = _passwordHasher.HashPassword(request.Password),
                Role = "User",
                DateJoined = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == login.Email);

            if (user == null || !_passwordHasher.VerifyPassword(login.Password, user.Password))
            {
                return Unauthorized("Invalid email or password");
            }

            var token = GenerateJwtToken(user);
            return Ok(new
            {
                message = "Login successful",
                userId = user.Id,
                firstName = user.FirstName,
                email = user.Email,
                role = user.Role,
                token = token
            });
        }
        
        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.Password = _passwordHasher.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ----------------------- AUTHENTICATED ENDPOINTS -----------------------

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.Role,
                user.ProfileImageUrl
            });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            // Check if the new email already exists for another user
            var existingUserWithSameEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == updatedUser.Email && u.Id != id);

            if (existingUserWithSameEmail != null)
            {
                return Conflict("A user with this email already exists.");
            }

            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.MobileNumber = updatedUser.MobileNumber;
            user.Email = updatedUser.Email;
            user.ProfileImageUrl = updatedUser.ProfileImageUrl;
            user.Role = updatedUser.Role;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/upload-profile-image")]
        public async Task<IActionResult> UploadProfileImage(int id, IFormFile file)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            if (file == null || file.Length == 0) return BadRequest("No file uploaded");
            if (file.Length > 5 * 1024 * 1024) return BadRequest("File size exceeds the 5MB limit.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.");
            }

            var fileName = $"profile_{id}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine("wwwroot", "images", fileName);
            var directoryPath = Path.GetDirectoryName(filePath);
            
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath!);
            }

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            user.ProfileImageUrl = $"/images/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = user.ProfileImageUrl });
        }

        [Authorize]
        [HttpDelete("{id}/profile-image")]
        public async Task<IActionResult> DeleteProfileImage(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || string.IsNullOrEmpty(user.ProfileImageUrl)) return NotFound();

            var fileName = Path.GetFileName(user.ProfileImageUrl);
            var filePath = Path.Combine("wwwroot", "images", fileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            user.ProfileImageUrl = null;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        // ----------------------- ADMIN ENDPOINTS -----------------------

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            // Project the results to avoid sending sensitive data like hashed passwords
            return Ok(users.Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.MobileNumber,
                u.Role,
                u.DateJoined,
                u.ProfileImageUrl
            }));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(user.ProfileImageUrl))
            {
                var fileName = Path.GetFileName(user.ProfileImageUrl);
                var filePath = Path.Combine("wwwroot", "images", fileName);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        // ----------------------- PRIVATE METHODS -----------------------

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.");
            var key = Encoding.ASCII.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Email ?? string.Empty),
                    new Claim(ClaimTypes.Role, user.Role ?? string.Empty),
                    new Claim("userId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}