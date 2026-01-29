using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    public class ReinicioContrasena
    {
        [Column("IdPersona")]
        public required int IdPersona { get; set; }

        [Column("Codigo")]
        public required string Codigo { get; set; }

        [Column("FechaCreacion")]
        public required DateTime FechaCreacion { get; set; }

        [ForeignKey("IdPersona")]
        public virtual User User { get; set; }
    }
}
