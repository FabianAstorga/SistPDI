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

    }
}
