using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Acuerdo> Acuerdos { get; set; } = null!;
        public DbSet<Institucion> Instituciones { get; set; } = null!;
        public DbSet<SvgTemplate> SvgTemplates { get; set; } = null!;
        public DbSet<Contacto> Contactos { get; set; } = null!;
        public DbSet<Empleado> Empleados { get; set; } = null!;
        public DbSet<AcuerdoContacto> AcuerdoContactos { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AcuerdoContacto>()
                .HasKey(ac => new { ac.IdAcuerdo, ac.IdContacto });

            modelBuilder.Entity<Acuerdo>()
                .HasOne(a => a.Institucion)
                .WithMany()
                .HasForeignKey(a => a.IdInstitucion)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Acuerdo>()
                .HasOne(a => a.SvgTemplate)
                .WithMany()
                .HasForeignKey(a => a.IdSvgTemplate)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SvgTemplate>()
                .HasOne(s => s.User)
                .WithMany(u => u.SvgTemplates)
                .HasForeignKey(s => s.IdUser)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.HasOne(e => e.user)        
                      .WithMany()                
                      .HasForeignKey(e => e.idCreador)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}