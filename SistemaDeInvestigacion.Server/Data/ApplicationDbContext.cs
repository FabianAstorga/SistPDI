using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Servicios;

namespace SistemaDeInvestigacion.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IPayloadEncryptedService _crypto;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IPayloadEncryptedService crypto)
            : base(options)
        {
            _crypto = crypto;
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Acuerdo> Acuerdos { get; set; } = null!;
        public DbSet<Empresas> Empresas { get; set; } = null!;
        public DbSet<SvgTemplate> SvgTemplates { get; set; } = null!;
        public DbSet<Contacto> Contactos { get; set; } = null!;
        public DbSet<Empleado> Empleados { get; set; } = null!;
        public DbSet<AcuerdoContacto> AcuerdoContactos { get; set; } = null!;
        public DbSet<AcuerdosUsersTemplates> AcuerdosUserTemplates { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ✅ Converters
            var enc = new EncryptedStringConverter(_crypto);                 // random
            var encDet = new DeterministicEncryptedStringConverter(_crypto); // determinístico (PK/FK)

            // 1. Configuración de ACUERDOS
            modelBuilder.Entity<Acuerdo>(entity =>
            {
                entity.ToTable("acuerdos");
                entity.HasKey(e => e.IdAcuerdo);

                entity.Property(e => e.IdAcuerdo).UseIdentityColumn();
                entity.Property(e => e.Habilitado).HasDefaultValue(false);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.FechaActualizacion).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(d => d.Empresas)
                    .WithMany()
                    .HasForeignKey(d => d.IdEmpresa)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FkEmpresa");
            });

            // 2. Configuración de EMPRESAS
            modelBuilder.Entity<Empresas>(entity =>
            {
                entity.ToTable("empresas");
                entity.HasKey(e => e.IdEmpresa);
                entity.Property(e => e.IdEmpresa).UseIdentityColumn();
            });

            // 3. Configuración de CONTACTOS
            modelBuilder.Entity<Contacto>(entity =>
            {
                entity.ToTable("contactos");
                entity.HasKey(e => e.IdContacto);
            });

            // 4. Configuración de EMPLEADOS + CIFRADO
            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.ToTable("empleados");
                entity.HasKey(e => e.Rut);

                // ✅ RUT (PK): determinístico
                entity.Property(e => e.Rut)
                      .HasColumnName("rut")
                      .HasConversion(encDet);

                // ✅ correo_electronico: random (nullable)
                entity.Property(e => e.CorreoElectronico)
                      .HasColumnName("correo_electronico")
                      .HasConversion(encDet);

                // ✅ nombre_completo: random (nullable)
                entity.Property(e => e.NombreCompleto)
                      .HasColumnName("nombre_completo")
                      .HasConversion(enc);
            });

            // 5. Configuración de USERS + CIFRADO (Rut FK)
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.IdPersona);

                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Rol).HasDefaultValue(1);

                // ✅ Este Property solo compila si tu clase User tiene propiedad Rut
                entity.Property(e => e.Rut)
                      .HasConversion(encDet);

                entity.HasOne(d => d.Empleado)
                    .WithMany()
                    .HasForeignKey(d => d.Rut)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_persona");
            });

            // 6. Configuración de SVG_TEMPLATES
            modelBuilder.Entity<SvgTemplate>(entity =>
            {
                entity.ToTable("svg_templates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id").UseIdentityColumn();
                entity.Property(e => e.SvgOriginal).HasColumnName("svg_original");
                entity.Property(e => e.SvgEditado).HasColumnName("svg_editado");
                entity.Property(e => e.Estado).HasColumnName("estado");
                entity.Property(e => e.FechaCreacion).HasColumnName("fechaCreacion");
                entity.Property(e => e.FechaActualizacion).HasColumnName("fechaActualizacion");
            });

            // 7. Configuración de ACUERDOS/CONTACTOS
            modelBuilder.Entity<AcuerdoContacto>(entity =>
            {
                entity.ToTable("acuerdos/contactos");
                entity.HasKey(e => new { e.IdEmpresa, e.IdContacto });

                entity.Property(e => e.IdEmpresa).HasColumnName("idEmpresa");
                entity.Property(e => e.IdContacto).HasColumnName("idContacto");

                entity.HasOne(d => d.Empresas)
                    .WithMany()
                    .HasForeignKey(d => d.IdEmpresa)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("fk_empresa_id");

                entity.HasOne(d => d.Contacto)
                    .WithMany()
                    .HasForeignKey(d => d.IdContacto)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("fk_contacto_id");
            });

            // 8. Configuración de ACUERDOS/USERS/TEMPLATES
            modelBuilder.Entity<AcuerdosUsersTemplates>(entity =>
            {
                entity.ToTable("acuerdos/users/templates");
                entity.HasKey(e => new { e.IdUsuario, e.IdSvg });

                entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");
                entity.Property(e => e.IdSvg).HasColumnName("idSvg");
                entity.Property(e => e.IdAcuerdo).HasColumnName("idAcuerdo");

                entity.HasOne(d => d.Acuerdo)
                    .WithMany()
                    .HasForeignKey(d => d.IdAcuerdo)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_acuerdo")
                    .IsRequired(false);

                entity.HasOne(d => d.User)
                    .WithMany()
                    .HasForeignKey(d => d.IdUsuario)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_creador2");

                entity.HasOne(d => d.SvgTemplate)
                    .WithMany()
                    .HasForeignKey(d => d.IdSvg)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_svg");
            });
        }
    }
}
