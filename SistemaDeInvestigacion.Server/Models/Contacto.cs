using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("contactos")]
    public class Contacto
    {
        [Key]
        [Column("idContacto")]
        public  required int IdContacto { get; set; }

        [Column("Nombre")]
        public required string Nombre { get; set; }

        [Column("Rol")]
        public string? Rol { get; set; }

        [Column("Email")]
        public string? Email { get; set; }
    }
}