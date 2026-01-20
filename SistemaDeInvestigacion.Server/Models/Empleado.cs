using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("empleados")]
    public class Empleado
    {
        [Key]
        [Column("rut")]
        public required string Id { get; set; }

        [Column("correo_electronico")]
        public required string CorreoElectronico { get; set; }

        [Column("nombre_completo")]
        public required string NombreCompleto { get; set; }



    }
}