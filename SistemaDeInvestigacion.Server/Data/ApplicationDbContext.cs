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
        public DbSet<Funcionarios> Funcionarios { get; set; } = null!;
        public DbSet<AcuerdoContacto> AcuerdoContactos { get; set; } = null!;
        public DbSet<AcuerdosUsersTemplates> AcuerdosUserTemplates { get; set; } = null!;
        public DbSet<Categoria> Categoria { get; set; } = null!;
        public DbSet<Estados> Estados { get; set; } = null!;
        public DbSet<Unidad> Unidades { get; set; } = null!;
        public DbSet<Comentarios> Comentarios { get; set; } = null!;
        public DbSet<ReinicioContrasena> ReinicioContrasena { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var enc = new EncryptedStringConverter(_crypto);
            var encDet = new DeterministicEncryptedStringConverter(_crypto);

            modelBuilder.Entity<Acuerdo>(entity =>
            {
                entity.ToTable("acuerdos");
                entity.HasKey(e => e.IdAcuerdo).HasName("convenios_pkey");

                entity.Property(e => e.IdAcuerdo)
                      .HasColumnName("IdAcuerdo")
                      .UseIdentityColumn();

                entity.Property(e => e.Titulo)
                      .HasColumnName("Titulo")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(e => e.Descripcion).HasColumnName("Descripcion");
                entity.Property(e => e.DetallesDescripcion).HasColumnName("DetallesDescripcion");

                entity.Property(e => e.FechaVencimiento)
                      .HasColumnName("FechaVencimiento")
                      .HasColumnType("date");

                entity.Property(e => e.PDFUrl)
                      .HasColumnName("PDFUrl")
                      .HasMaxLength(255);

                entity.Property(e => e.ImagenUrl)
                      .HasColumnName("ImagenUrl")
                      .HasMaxLength(255);

                entity.Property(e => e.IdEstado).HasColumnName("idEstado");
                entity.Property(e => e.IdEmpresa).HasColumnName("IdEmpresa");
                entity.Property(e => e.IdCategoria).HasColumnName("IdCategoria");

                entity.Property(e => e.FechaCreacion)
                      .HasColumnName("FechaCreacion")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.FechaActualizacion)
                      .HasColumnName("FechaActualizacion")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

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

                entity.HasOne(d => d.Estados)
                      .WithMany()
                      .HasForeignKey(d => d.IdEstado)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_acuerdos_estados");
            });

            modelBuilder.Entity<Empresas>(entity =>
            {
                entity.ToTable("empresas");
                entity.HasKey(e => e.IdEmpresa).HasName("instituciones_pkey");

                entity.Property(e => e.IdEmpresa)
                      .HasColumnName("IdEmpresa")
                      .UseIdentityColumn();

                entity.Property(e => e.Nombre)
                      .HasColumnName("Nombre")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(e => e.Descripcion).HasColumnName("Descripcion");
                entity.Property(e => e.Logo).HasColumnName("Logo").HasMaxLength(255);
                entity.Property(e => e.SitioWeb).HasColumnName("SitioWeb").HasMaxLength(255);
                entity.Property(e => e.Email).HasColumnName("Email").HasMaxLength(255);
                entity.Property(e => e.Telefono).HasColumnName("Telefono");
                entity.Property(e => e.Direccion).HasColumnName("Direccion").HasMaxLength(255);

                entity.Property(e => e.FechaCreacion).HasColumnName("FechaCreacion");
                entity.Property(e => e.FechaActualizacion).HasColumnName("FechaActualizacion");
                entity.Property(e => e.IdEstado).HasColumnName("idEstado");

                entity.HasOne(d => d.Estados)
                      .WithMany()
                      .HasForeignKey(d => d.IdEstado)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_empresas_estado");
            });

            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("categoria");
                entity.HasKey(e => e.IdCategoria).HasName("categoria_pkey");

                entity.Property(e => e.IdCategoria).HasColumnName("idCategoria");
                entity.Property(e => e.TipoCategoria).HasColumnName("TipoCategoria").HasMaxLength(255);
                entity.Property(e => e.IdEstado).HasColumnName("idEstado");

                entity.HasOne(d => d.Estados)
                      .WithMany()
                      .HasForeignKey(d => d.IdEstado)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_categoria_estado");
            });


            modelBuilder.Entity<Estados>(entity =>
            {
                entity.ToTable("estados");
                entity.HasKey(e => e.IdEstado).HasName("estados_pkey");

                entity.Property(e => e.IdEstado).HasColumnName("IdEstado");
                entity.Property(e => e.Descripcion).HasColumnName("Descripcion").HasMaxLength(255);
            });

            modelBuilder.Entity<Unidad>(entity =>
            {
                entity.ToTable("unidad");
                entity.HasKey(e => e.idUnidad).HasName("unidad_pkey");

                entity.Property(e => e.idUnidad).HasColumnName("idUnidad");
                entity.Property(e => e.Nombre).HasColumnName("Nombre").HasMaxLength(255);
            });

            modelBuilder.Entity<Funcionarios>(entity =>
            {
                entity.ToTable("funcionarios");
                entity.HasKey(e => e.Rut).HasName("empleados_pkey");

                entity.Property(e => e.Rut)
                      .HasColumnName("rut")
                      .HasConversion(encDet);

                entity.Property(e => e.CorreoElectronico)
                      .HasColumnName("correo_electronico")
                      .HasConversion(encDet);

                entity.Property(e => e.NombreCompleto)
                      .HasColumnName("nombre_completo")
                      .HasConversion(enc);

                entity.Property(e => e.idUnidad).HasColumnName("idUnidad");

                entity.HasOne(d => d.Unidad)
                      .WithMany()
                      .HasForeignKey(d => d.idUnidad)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_funcionario_unidad");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.IdPersona).HasName("users_pkey");

                entity.Property(e => e.IdPersona)
                      .HasColumnName("IdPersona")
                      .UseIdentityColumn();

                entity.Property(e => e.FechaCreacion)
                      .HasColumnName("FechaCreacion")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.Contrasena)
                      .HasColumnName("Contrasena")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(e => e.Rol)
                      .HasColumnName("Rol")
                      .HasDefaultValue((short)1);

                entity.Property(e => e.Rut)
                      .HasColumnName("Rut")
                      .HasConversion(encDet)
                      .IsRequired();

                entity.Property(e => e.idEstado).HasColumnName("idEstado");

                entity.HasOne(d => d.Funcionarios)
                      .WithMany()
                      .HasForeignKey(d => d.Rut)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_persona");

                entity.HasOne(d => d.Estados)
                      .WithMany()
                      .HasForeignKey(d => d.idEstado)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_users_estado");
            });


            modelBuilder.Entity<Contacto>(entity =>
            {
                entity.ToTable("contactos");
                entity.HasKey(e => e.IdContacto).HasName("contactos_pkey");

                entity.Property(e => e.IdContacto)
                      .HasColumnName("idContacto")
                      .UseIdentityColumn();

                entity.Property(e => e.Nombre)
                      .HasColumnName("Nombre")
                      .HasMaxLength(255)
                      .IsRequired();

                entity.Property(e => e.Email).HasColumnName("Email").HasMaxLength(255);
                entity.Property(e => e.Numero).HasColumnName("Numero");
            });

            modelBuilder.Entity<Comentarios>(entity =>
            {
                entity.ToTable("comentarios");
                entity.HasKey(e => e.IdComentario).HasName("comentarios_pkey");

                entity.Property(e => e.IdComentario).HasColumnName("IdComentario");
                entity.Property(e => e.IdAcuerdo).HasColumnName("IdAcuerdo");
                entity.Property(e => e.Comentario).HasColumnName("Comentario");
                entity.Property(e => e.NombreUsuario).HasColumnName("NombreUsuario");

                entity.HasOne(d => d.Acuerdo)
                      .WithMany()
                      .HasForeignKey(d => d.IdAcuerdo)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_comentario_acuerdo");

            });


            modelBuilder.Entity<SvgTemplate>(entity =>
            {
                entity.ToTable("svg_templates");
                entity.HasKey(e => e.Id).HasName("svg_templates_pkey1");

                entity.Property(e => e.Id).HasColumnName("id").UseIdentityColumn();
                entity.Property(e => e.SvgOriginal).HasColumnName("svg_original");
                entity.Property(e => e.SvgEditado).HasColumnName("svg_editado");
                entity.Property(e => e.IdEstado).HasColumnName("idEstado");
                entity.Property(e => e.FechaCreacion).HasColumnName("fechaCreacion");
                entity.Property(e => e.FechaActualizacion).HasColumnName("fechaActualizacion");

                entity.HasOne(d => d.Estados)
                      .WithMany()
                      .HasForeignKey(d => d.IdEstado)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_svg_templates_estados_1");
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
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_empresa_id");

                entity.HasOne(d => d.Contacto)
                      .WithMany()
                      .HasForeignKey(d => d.IdContacto)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_contacto_id");
            });

            modelBuilder.Entity<AcuerdosUsersTemplates>(entity =>
            {
                entity.ToTable("acuerdos/users/templates");
                entity.HasKey(e => e.IdBorrador).HasName("acuerdos/users/templates_pkey");

                entity.Property(e => e.IdBorrador).HasColumnName("idBorrador");
                entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");
                entity.Property(e => e.IdSvg).HasColumnName("idSvg");
                entity.Property(e => e.IdAcuerdo).HasColumnName("idAcuerdo");

                entity.HasOne(d => d.Acuerdo)
                      .WithMany()
                      .HasForeignKey(d => d.IdAcuerdo)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_acuerdo");

                entity.HasOne(d => d.User)
                      .WithMany()
                      .HasForeignKey(d => d.IdUsuario)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_creador");

                entity.HasOne(d => d.SvgTemplate)
                      .WithMany()
                      .HasForeignKey(d => d.IdSvg)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("fk_svg");
            });

            modelBuilder.Entity<ReinicioContrasena>(entity =>
            {
                entity.ToTable("reiniciocontrasena");

                entity.HasKey(e => new { e.IdPersona, e.Codigo });

                entity.Property(e => e.IdPersona)
                      .HasColumnName("IdPersona");

                entity.Property(e => e.Codigo)
                      .HasColumnName("Codigo")
                      .HasMaxLength(6)
                      .IsRequired();

                entity.Property(e => e.FechaCreacion)
                      .HasColumnName("FechaCreacion")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(d => d.User)
                      .WithMany()
                      .HasForeignKey(d => d.IdPersona)
                      .OnDelete(DeleteBehavior.Cascade)
                      .HasConstraintName("fk_reinicio_usuario");
            });
        }

    }
}
