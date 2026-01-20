using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos/contactos")]
    public class AcuerdoContacto
    {
        [Column("idEMpresa")]
        public int IdEmpresa { get; set; }

        [Column("idContacto")]
        public int IdContacto { get; set; }

        [ForeignKey("idEMpresa")]
        public virtual Empresas? Empresas { get; set; }

        [ForeignKey("IdContacto")]
        public virtual Contacto? Contacto { get; set; }
    }
}