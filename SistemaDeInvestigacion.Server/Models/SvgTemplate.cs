using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_templates")]
    public class SvgTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Column("svg_original")]
        public string? SvgOriginal { get; set; }

        [Column("svg_editado")]
        public string? SvgEditado { get; set; }

        [Column("IdEstado")]
        public int IdEstado { get; set; }

        [Column("fechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("fechaActualizacion")]
        public DateTime? FechaActualizacion { get; set; }
        [ForeignKey("IdEstado")]
        public virtual Estados Estados { get; set; }
    }
}