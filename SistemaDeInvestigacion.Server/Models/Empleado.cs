using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("empleados")]
    public class Empleado
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string? Nombre { get; set; }

        [Column("rut")]
        public string? Rut { get; set; }

        [Column("brigada")]
        public string? Brigada { get; set; }

        [Column("cargo")]
        public string? Cargo { get; set; }

        [Column("telefono")]
        public int? Telefono { get; set; }
    }
}