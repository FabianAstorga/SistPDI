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
        public int IdComentario { get; set; }

        [Required]
        [Column("IdAcuerdo")]
        public int IdAcuerdo { get; set; }

        [Required]
        [Column("Comentario")]
        public required string Comentario { get; set;}

        [Required]
        [Column("IdPersona")]
        public required int IdPersona { get; set; }
        
        [ForeignKey("IdPersona")]
        public virtual User? User { get; set; }

        [ForeignKey("IdAcuerdo")]
        public virtual Acuerdo? Acuerdo { get; set; }
    }
}
