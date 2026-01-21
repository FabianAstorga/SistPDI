using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("acuerdos/users/templates")]
    public class AcuerdosUsersTemplates
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("idBorrador")]
        public int? IdBorrador { get; set; }


        [Column("idUsuario")]
        public required int IdUsuario { get; set; }

        [Column("idSvg")]
        public int? IdSvg { get; set; }

        [Column("idAcuerdo")]
        public int? IdAcuerdo { get; set; }


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