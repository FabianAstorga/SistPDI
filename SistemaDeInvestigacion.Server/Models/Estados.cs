using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("estados")]
    public class Estados
        {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("IdEstado")]
        public int IdEstado { get; set; }

        [Required]
        [Column("Descripcion")]
        public required string Descripcion { get; set; }

    }

}

