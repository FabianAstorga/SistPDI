using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_documento_render")]
    public class SvgDocumentoRender
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("documento_id")]
        public int DocumentoId { get; set; }

        [Column("usuario_id")]
        public long UsuarioId { get; set; }

        [Column("svg_renderizado")]
        [Required]
        public string SvgRenderizado { get; set; } = null!;

        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [ForeignKey("DocumentoId")]
        public virtual SvgDocumento? Documento { get; set; }

        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }
    }
}