using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Book> Books => Set<Book>();
        public DbSet<ContactQuery> ContactQueries => Set<ContactQuery>();
        public DbSet<User> Users { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<RecentView> RecentViews { get; set; }
        public DbSet<FaqQuestion> FaqQuestions { get; set; }
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<BookSaleEvent> BookSaleEvents { get; set; }
        public DbSet<QuizData> QuizDatas { get; set; }
        public DbSet<MonthlyQuizAttempt> MonthlyQuizAttempts { get; set; }
        public DbSet<StartupPopupSettings> StartupPopupSettings { get; set; }
        public DbSet<AboutContent> AboutContents { get; set; }
        public DbSet<ContactInfo> ContactInfos { get; set; }
        public DbSet<CouponStock> CouponStocks { get; set; }

        //category of books
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Book>()
                .HasDiscriminator<string>("Category")
                .HasValue<MedicalBook>("Medical")
                .HasValue<FictionBook>("Fiction")
                .HasValue<EducationalBook>("Educational")
                .HasValue<IndianBook>("Indian");

            modelBuilder.Entity<Coupon>()
                .HasOne(c => c.Stock)
                .WithOne(s => s.Coupon)
                .HasForeignKey<CouponStock>(s => s.CouponId);

            base.OnModelCreating(modelBuilder);
        }
    }
}