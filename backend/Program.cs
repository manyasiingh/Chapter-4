using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new BookJsonConverter());
    });

// Configure SQLite - FIX THIS LINE:
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))); // ← CHANGED

//new
builder.Services.AddScoped<CouponService>();
//new completed

// Enable Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable CORS - UPDATE FOR PRODUCTION:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>  // ← CHANGED NAME
    {
        policy.AllowAnyOrigin()  // ← ALLOW ALL IN PRODUCTION
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JWT Authentication setup
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.");
var key = Encoding.ASCII.GetBytes(jwtKey);
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var connectionString = config.GetConnectionString("DefaultConnection");
        
        // Seed database from bookstore.db
        DbSeeder.SeedFromFile("./bookstore.db", connectionString);
        
        // Ensure database is created
        Console.WriteLine("Ensuring database exists...");
        db.Database.EnsureCreated();
        Console.WriteLine("✅ Database ready!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Database warning: {ex.Message}");
        // Continue without crashing
    }
}

// Use Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS - UPDATE TO MATCH:
app.UseCors("AllowAll");  // ← CHANGED TO "AllowAll"

// ADD THESE 3 LINES FOR REACT SERVING:
app.UseDefaultFiles();     // ← ADD THIS
app.UseStaticFiles();      // ← KEEP THIS (you already have it)
app.MapFallbackToFile("index.html");  // ← ADD THIS (CRITICAL FOR REACT ROUTER)

// Only in development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
