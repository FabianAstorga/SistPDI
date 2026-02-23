using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Data
{
    public class KeysDbContext : DbContext, IDataProtectionKeyContext
    {
        public KeysDbContext(DbContextOptions<KeysDbContext> options) : base(options) { }

        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("proteccion");
        }
    }
}