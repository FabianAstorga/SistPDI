using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos/empleados")]
    public class AcuerdoEmpleado
    {
        [Column("idEmpleado")]
        public int? IdEmpleado { get; set; }

        [Column("idAcuerdo")]
        public int? IdAcuerdo { get; set; }

        [ForeignKey("IdAcuerdo")]
        public virtual Acuerdo? Acuerdo { get; set; }

        [ForeignKey("IdEmpleado")]
        public virtual Empleado? Empleado { get; set; }
    }
}