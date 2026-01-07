using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_documento")]
    public class SvgDocumento
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("tipo")]
        [Required]
        [StringLength(50)]
        public string Tipo { get; set; } = null!;

        [Column("alto")]
        public int? Alto { get; set; }

        [Column("ancho")]
        public int? Ancho { get; set; }

        [Column("viewbox")]
        [StringLength(100)]
        public string? Viewbox { get; set; }

        [Column("estado")]
        [Required]
        [StringLength(50)]
        public string Estado { get; set; } = "borrador";

        [Column("usuario_id")]
        public long UsuarioId { get; set; }

        [Column("institucion_id")]
        public int? InstitucionId { get; set; }

        [Column("nombre_archivo")]
        [Required]
        [StringLength(255)]
        public string NombreArchivo { get; set; } = null!;

        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("fecha_actualizacion")]
        public DateTime? FechaActualizacion { get; set; }

        // Propiedades de navegación (Relaciones)
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        [ForeignKey("InstitucionId")]
        public virtual Institucion? Institucion { get; set; }
    }
}