using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Convenio> Convenios { get; set; } = null!;
        public DbSet<SvgFiles> SvgTemplates { get; set; } = null!;
        public DbSet<Documento> Documentos { get; set; } = null!;
        public DbSet<Contacto> Contactos { get; set; } = null!;
        public DbSet<Objetivo> Objetivos { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuramos las relaciones uno a muchos de Convenios
            modelBuilder.Entity<Convenio>()
                .HasMany(c => c.Documentos)
                .WithOne()
                .HasForeignKey(d => d.ConvenioId);

            modelBuilder.Entity<Convenio>()
                .HasMany(c => c.Contactos)
                .WithOne()
                .HasForeignKey(co => co.ConvenioId);

            modelBuilder.Entity<Convenio>()
                .HasMany(c => c.Objetivos)
                .WithOne()
                .HasForeignKey(o => o.ConvenioId);
        }
    }
}