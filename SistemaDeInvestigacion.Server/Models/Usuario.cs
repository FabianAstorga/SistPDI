using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("nombre")]
        [StringLength(255)]
        public string? Nombre { get; set; }

        [Column("email")]
        [StringLength(255)]
        public string? Email { get; set; }

        [Column("emailverificacion")]
        public DateTime? EmailVerificacion { get; set; }

        [Column("contraseña")]
        [StringLength(255)]
        public string? Contraseña { get; set; }

        [Column("fechacreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("fechaactualizacion")]
        public DateTime? FechaActualizacion { get; set; }
    }
}