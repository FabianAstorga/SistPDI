using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Models;
namespace SistemaDeInvestigacion.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Usuario> Usuarios { get; set; } = null!;
        public DbSet<Institucion> Instituciones { get; set; } = null!;
        public DbSet<SvgDocumento> SvgDocumentos { get; set; } = null!;
        public DbSet<SvgCapa> SvgCapas { get; set; } = null!;
        public DbSet<SvgCapaVersion> SvgCapaVersiones { get; set; } = null!;
        public DbSet<SvgDocumentoRender> SvgDocumentoRenders { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<SvgCapaVersion>()
                .HasIndex(v => new { v.CapaId, v.NumeroVersion })
                .IsUnique()
                .HasDatabaseName("uq_svg_capa_version_capa_numero");
            modelBuilder.Entity<SvgCapa>()
                .ToTable(t => t.HasCheckConstraint("chk_svg_capa_opacidad", "opacidad >= 0.0 AND opacidad <= 1.0"));
            modelBuilder.Entity<SvgCapa>()
                .HasOne<SvgCapaVersion>()
                .WithMany()
                .HasForeignKey(c => c.VersionActualId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}