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
        public required string Nombre { get; set; }

        [Column("rut")]
        public required string Rut { get; set; }

        [Column("brigada")]
        public string? Brigada { get; set; }

        [Column("cargo")]
        public string? Cargo { get; set; }

        [Column("telefono")]
        public int? Telefono { get; set; }

        [Column("mail")]
        public required string Mail { get; set; }

        [Column("idCreador")]
        public required long idCreador { get; set; }

        [ForeignKey("idCreador")]
        public virtual User? user { get; set; }

    }
}