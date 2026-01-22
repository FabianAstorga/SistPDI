using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("contactos")]
    public class Contacto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("idContacto")]
        public int? IdContacto { get; set; }

        [Column("Nombre")]
        public required string Nombre { get; set; }

        [Column("Numero")]
        public int? Numero { get; set; }

        [Column("Email")]
        public string? Email { get; set; }
    }
}