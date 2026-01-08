using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace SistemaDeInvestigacion.Server.Models
{
    [Table("contactos")]
    public class Contacto
    {
        [Key][Column("id")] public int Id { get; set; }
        [Column("convenio_id")] public int ConvenioId { get; set; }
        [Column("name")] public required string Name { get; set; }
        [Column("role")] public string? Role { get; set; }
        [Column("email")] public string? Email { get; set; }
    }
}
