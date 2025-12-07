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
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<SpinReward> SpinRewards { get; set; }
        public DbSet<SpinRewardOption> SpinRewardOptions { get; set; }

        // ---------------------------------------------------------------
        // MODEL CONFIGURATION
        // ---------------------------------------------------------------
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Book category discriminator
            modelBuilder.Entity<Book>()
                .HasDiscriminator<string>("Category")
                .HasValue<MedicalBook>("Medical")
                .HasValue<FictionBook>("Fiction")
                .HasValue<EducationalBook>("Educational")
                .HasValue<IndianBook>("Indian");

            // Coupon ↔ Stock (1-to-1)
            modelBuilder.Entity<Coupon>()
                .HasOne(c => c.Stock)
                .WithOne(s => s.Coupon)
                .HasForeignKey<CouponStock>(s => s.CouponId);

            // -----------------------------------------------------
            // OPTIONAL: Seed default Spin Wheel options
            // Remove this entire block if you do NOT want defaults
            // -----------------------------------------------------
            modelBuilder.Entity<SpinRewardOption>().HasData(
                new SpinRewardOption { Id = 1, RewardType = "DISCOUNT", RewardValue = "5%", IsActive = true, SortOrder = 1 },
                new SpinRewardOption { Id = 2, RewardType = "DISCOUNT", RewardValue = "10%", IsActive = true, SortOrder = 2 },
                new SpinRewardOption { Id = 3, RewardType = "DISCOUNT", RewardValue = "20%", IsActive = true, SortOrder = 3 },
                new SpinRewardOption { Id = 4, RewardType = "POINTS", RewardValue = "50", IsActive = true, SortOrder = 4 },
                new SpinRewardOption { Id = 5, RewardType = "POINTS", RewardValue = "100", IsActive = true, SortOrder = 5 },
                new SpinRewardOption { Id = 6, RewardType = "FREE_DELIVERY", RewardValue = "YES", IsActive = true, SortOrder = 6 }
            );
        }
    }
}
