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
        public DbSet<AcuerdoEmpleado> AcuerdoEmpleados { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Configuración de llave compuesta para tabla intermedia Acuerdos/Contactos
            modelBuilder.Entity<AcuerdoContacto>()
                .HasKey(ac => new { ac.IdAcuerdo, ac.IdContacto });

            // 2. Configuración para tabla intermedia Acuerdos/Empleados 
            // Como en tu SQL no tiene Primary Key, la configuramos como Keyless o llave compuesta
            modelBuilder.Entity<AcuerdoEmpleado>()
                .HasKey(ae => new { ae.IdAcuerdo, ae.IdEmpleado });

            // 3. Relación Uno a Muchos: Institucion -> Acuerdos
            modelBuilder.Entity<Acuerdo>()
                .HasOne(a => a.Institucion)
                .WithMany()
                .HasForeignKey(a => a.IdInstitucion)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Relación Uno a Muchos: SvgTemplate -> Acuerdos
            modelBuilder.Entity<Acuerdo>()
                .HasOne(a => a.SvgTemplate)
                .WithMany()
                .HasForeignKey(a => a.IdSvgTemplate)
                .OnDelete(DeleteBehavior.Restrict);

            // 5. Relación Uno a Muchos: User -> SvgTemplates
            modelBuilder.Entity<SvgTemplate>()
                .HasOne(s => s.User)
                .WithMany(u => u.SvgTemplates)
                .HasForeignKey(s => s.IdUser)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}