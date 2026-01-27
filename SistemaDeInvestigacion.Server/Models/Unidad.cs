using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("unidad")]
    public class Unidad
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("idUnidad")]

        public int? idUnidad { get; set; }

        [Required]
        [Column("Nombre")]
        public required string Nombre { get; set; }


    }
}
