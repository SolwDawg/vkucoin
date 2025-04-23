using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace backend.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityRegistration> ActivityRegistrations { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<TransactionLog> TransactionLogs { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Cấu hình các bảng và quan hệ
            builder.Entity<User>(entity =>
            {
                entity.Property(u => u.FullName).HasMaxLength(100);
                entity.Property(u => u.Class).HasMaxLength(50);
                entity.Property(u => u.Role).HasMaxLength(20);

                // Mỗi User có một Wallet (1-1)
                entity.HasOne(u => u.Wallet)
                     .WithOne(w => w.User)
                     .HasForeignKey<Wallet>(w => w.UserId)
                     .OnDelete(DeleteBehavior.Cascade);


            });

            builder.Entity<Wallet>(entity =>
            {
                entity.HasKey(w => w.Id);
                entity.Property(w => w.Address)
                     .HasMaxLength(42) // Địa chỉ Ethereum dài 42 ký tự (bao gồm 0x)
                     .IsRequired();

                entity.Property(w => w.PrivateKey)
                     .HasMaxLength(64) // Private key dài 64 ký tự hex
                     .IsRequired();

                entity.Property(w => w.Balance)
                     .HasColumnType("decimal(18,8)") // Lưu số dư với 8 số thập phân
                     .HasDefaultValue(0m); // Mặc định là 0

                // Index cho địa chỉ ví để tìm kiếm nhanh
                entity.HasIndex(w => w.Address)
                     .IsUnique();

                entity.HasOne(w => w.User)
                    .WithOne(u => u.Wallet)
                    .HasForeignKey<Wallet>(w => w.UserId);
            });

            builder.Entity<ActivityRegistration>()
                    .HasKey(ar => new { ar.StudentId, ar.ActivityId });

            builder.Entity<TransactionLog>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Amount)
                    .HasColumnType("decimal(18,8)");
                entity.Property(t => t.TransactionType)
                    .HasMaxLength(50)
                    .IsRequired();
                entity.Property(t => t.Description)
                    .HasMaxLength(255);
                
                entity.HasOne(t => t.User)
                    .WithMany()
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình seed data nếu cần
            builder.SeedData();
        }
    }

    public static class ModelBuilderExtensions
    {
        public static void SeedData(this ModelBuilder builder)
        {
            // Seed data cho admin user (sẽ được tạo bởi Program.cs)
            // Có thể thêm các seed data khác ở đây nếu cần
        }
    }
}