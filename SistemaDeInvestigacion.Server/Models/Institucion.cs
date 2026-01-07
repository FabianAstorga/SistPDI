using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("institucion")]
    public class Institucion
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = null!;

        [Column("fecha_creacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("fecha_actualizacion")]
        public DateTime? FechaActualizacion { get; set; }
    }
}