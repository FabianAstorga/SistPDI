using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{

    [Table("Categoria")]
    public class Categoria
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("IdCategoria")]
        public int IdCategoria { get; set; }

        [Column("TipoCategoria")]
        public required string TipoCategoria { get; set; }
        
        [Column("IdEstado")]
        public required int IdEstado { get; set; }

        [ForeignKey("IdEstado")]
        public virtual Estados? Estados { get; set; }
    }
}
