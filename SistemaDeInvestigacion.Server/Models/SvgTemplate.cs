using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_templates")]
    public class SvgTemplate
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("svg_original")]
        public string? SvgOriginal { get; set; }

        [Column("svg_editado")]
        public string? SvgEditado { get; set; }

        [Column("estado")]
        public bool? Estado { get; set; }

        [Column("fechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("fechaActualizacion")]
        public DateTime? FechaActualizacion { get; set; }
    }
}