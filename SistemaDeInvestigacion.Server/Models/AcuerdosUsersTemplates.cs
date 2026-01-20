using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos/users/templates")]
    public class AcuerdosUsersTemplates
    {
       
        [Column("idUsuario")]
        public required string IdUsuario { get; set; }

        [Column("idSvg")]
        public required long IdSvg { get; set; }

        [Column("idAcuerdo")]
        public  required long IdAcuerdo { get; set; }


        [ForeignKey("IdUsuario")]
        public virtual User? User { get; set; }

        [ForeignKey("IdSvg")]
        public virtual SvgTemplate? SvgTemplate { get; set; }

        [ForeignKey("IdAcuerdo")]
        public virtual Acuerdo? Acuerdo { get; set; }


        //[Column("idCreador")]
        //public long? IdCreador { get; set; }

        //[Column("IdInstitucion")]
        //public int? IdInstitucion { get; set; }

        //[Column("idSvgTemplate")]
        //public int? IdSvgTemplate { get; set; }

        //[ForeignKey("IdInstitucion")]
        //public virtual Institucion? Institucion { get; set; }

        //[ForeignKey("IdSvgTemplate")]
        //public virtual SvgTemplate? SvgTemplate { get; set; }
    }
}