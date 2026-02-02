using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("comentarios")]
    public class Comentarios
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("IdComentario")]
        public int? IdComentario { get; set; }

        [Required]
        [Column("IdAcuerdo")]
        public required int IdAcuerdo { get; set; }

        [Required]
        [Column("Comentario")]
        public required string Comentario { get; set;}

        [Column("NombreUsuario")]
        public string NombreUsuario { get; set;}

        [ForeignKey("IdAcuerdo")]
        public virtual Acuerdo? Acuerdo { get; set; }
    }
}
