using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models

{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("idPersona")]
        public required string IdPersona { get; set; }

        [Column("FechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("Contrasena")]
        public required string Contrasena { get; set; }

        [Column("Rol")]
        public required int Rol { get; set; }

        [ForeignKey("idPersona")]
        public virtual Empleado? Empleado { get; set; }



    }
}