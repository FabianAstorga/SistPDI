using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_capa_version")]
    public class SvgCapaVersion
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("capa_id")]
        public int CapaId { get; set; }

        [Column("numero_version")]
        public int NumeroVersion { get; set; }

        [Column("comentario")]
        public string? Comentario { get; set; }

        [Column("svg_capa")]
        [Required]
        public string SvgCapaContenido { get; set; } = null!;

        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [ForeignKey("CapaId")]
        public virtual SvgCapa? Capa { get; set; }
    }
}