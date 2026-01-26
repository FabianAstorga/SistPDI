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
        public DbSet<Categoria> Categoria { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var enc = new EncryptedStringConverter(_crypto);
            var encDet = new DeterministicEncryptedStringConverter(_crypto);

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

                entity.HasOne(d => d.Categoria)
                    .WithMany()
                    .HasForeignKey(d => d.IdCategoria)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FkCategoria");

            });

            modelBuilder.Entity<Empresas>(entity =>
            {
                entity.ToTable("empresas");
                entity.HasKey(e => e.IdEmpresa);
                entity.Property(e => e.IdEmpresa).UseIdentityColumn();
            });

            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("categoria");
                entity.HasKey(e => e.IdCategoria);
                entity.Property(e => e.IdCategoria).UseIdentityColumn();
            });

            modelBuilder.Entity<Contacto>(entity =>
            {
                entity.ToTable("contactos");
                entity.HasKey(e => e.IdContacto);
            });

            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.ToTable("empleados");
                entity.HasKey(e => e.Rut);

                entity.Property(e => e.Rut)
                      .HasColumnName("rut")
                      .HasConversion(encDet);

                entity.Property(e => e.CorreoElectronico)
                      .HasColumnName("correo_electronico")
                      .HasConversion(encDet);

                entity.Property(e => e.NombreCompleto)
                      .HasColumnName("nombre_completo")
                      .HasConversion(enc);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.IdPersona);

                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Rol).HasDefaultValue(1);

                entity.Property(e => e.Rut)
                      .HasConversion(encDet);

                entity.HasOne(d => d.Empleado)
                    .WithMany()
                    .HasForeignKey(d => d.Rut)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_persona");
            });

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
