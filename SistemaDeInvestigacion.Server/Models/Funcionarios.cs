using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("empleados")]
    public class Funcionarios
    {
        [Key]
        [Column("rut")]
        public required string Rut { get; set; }

        [Column("correo_electronico")]
        public required string CorreoElectronico { get; set; }

        [Column("nombre_completo")]
        public required string NombreCompleto { get; set; }
        
        [Column("idUnidad")]
        public required int idUnidad { get; set; }
        
        [ForeignKey("idUnidad")]
        public virtual Unidad? Unidad { get; set; }

    }
}