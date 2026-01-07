using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_capa")]
    public class SvgCapa
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("documento_id")]
        public int DocumentoId { get; set; }

        [Column("nombre")]
        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = "capa";

        [Column("orden_z")]
        public int OrdenZ { get; set; } = 0;

        [Column("visible")]
        public bool Visible { get; set; } = true;

        [Column("bloqueada")]
        public bool Bloqueada { get; set; } = false;

        [Column("opacidad")]
        public float Opacidad { get; set; } = 1.0f;

        [Column("modo_mezcla")]
        [StringLength(50)]
        public string? ModoMezcla { get; set; }

        [Column("version_actual_id")]
        public int? VersionActualId { get; set; }

        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("fecha_actualizacion")]
        public DateTime? FechaActualizacion { get; set; }

        [ForeignKey("DocumentoId")]
        public virtual SvgDocumento? Documento { get; set; }
    }
}