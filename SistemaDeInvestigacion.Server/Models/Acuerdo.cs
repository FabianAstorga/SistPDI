using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos")]
    public class Acuerdo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("IdAcuerdo")]
        public int IdAcuerdo { get; set; }

        [Column("Titulo")]
        public required string Titulo { get; set; }

        [Column("Descripcion")]
        public string? Descripcion { get; set; }

        [Column("DetallesDescripcion")]
        public string? DetallesDescripcion { get; set; }

        [Column("FechaVencimiento")]
        public DateTime? FechaVencimiento { get; set; }

        [Column("Estado")]
        public string? Estado { get; set; }

        [Column("PDFUrl")]
        public string? PDFUrl { get; set; }

        [Column("ImagenUrl")]
        public string? ImagenUrl { get; set; }

        [Column("Habilitado")]
        public bool? Habilitado { get; set; }

        [Column("FechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("FechaActualizacion")]
        public DateTime? FechaActualizacion { get; set; }

        [Column("idCreador")]
        public long? IdCreador { get; set; }

        [Column("IdInstitucion")]
        public int? IdInstitucion { get; set; }

        [Column("idSvgTemplate")]
        public int? IdSvgTemplate { get; set; }

        [ForeignKey("IdInstitucion")]
        public virtual Institucion? Institucion { get; set; }

        [ForeignKey("IdSvgTemplate")]
        public virtual SvgTemplate? SvgTemplate { get; set; }
    }
}