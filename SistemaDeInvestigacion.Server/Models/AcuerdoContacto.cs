using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos/contactos")]
    public class AcuerdoContacto
    {
        [Column("idAcuerdo")]
        public int IdAcuerdo { get; set; }

        [Column("idContacto")]
        public int IdContacto { get; set; }

        [ForeignKey("IdAcuerdo")]
        public virtual Acuerdo? Acuerdo { get; set; }

        [ForeignKey("IdContacto")]
        public virtual Contacto? Contacto { get; set; }
    }
}