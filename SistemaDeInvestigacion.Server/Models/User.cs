using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models

{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("IdUsuario")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long IdUsuario { get; set; }

        [Column("Nombre")]
        public required string Nombre { get; set; }

        [Column("Mail")]
        public required string Mail { get; set; }

        [Column("FechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("FechaActualizacion")]
        public DateTime? FechaActualizacion { get; set; }

        [Column("Contrasena")]
        public required string Contrasena { get; set; }

        [Column("Rol")]
        public required int Rol { get; set; }

        public virtual ICollection<SvgTemplate> SvgTemplates { get; set; } = new List<SvgTemplate>();


    }
}