using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos/contactos")]
    public class AcuerdoContacto
    {
        [Column("idEmpresa")]
        public int IdEmpresa { get; set; }

        [Column("idContacto")]
        public int IdContacto { get; set; }

        public virtual Empresas? Empresas { get; set; }

        public virtual Contacto? Contacto { get; set; }
    }
}