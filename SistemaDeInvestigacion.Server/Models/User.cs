using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models

{
    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("IdPersona")]
        public int? IdPersona { get; set; }

        [Column("FechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("Contrasena")]
        public required string Contrasena { get; set; }

        [Column("Rol")]
        public required int Rol { get; set; }
        
        [Column("idEstado")]
        public required int idEstado { get; set; }

        [Column("Rut")]
        public required string Rut { get; set; }

        [ForeignKey("Rut")]
        public virtual Funcionarios? Funcionarios { get; set; }

        [ForeignKey("idEstado")]
        public virtual Estados Estados { get; set; } = null!;

    }

}