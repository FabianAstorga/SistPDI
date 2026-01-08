using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace SistemaDeInvestigacion.Server.Models
{
    [Table("objetivos")]
    public class Objetivo
    {
        [Key][Column("id")] public int Id { get; set; }
        [Column("convenio_id")] public int ConvenioId { get; set; }
        [Column("objetivo")] public required string TextoObjetivo { get; set; }
    }
}
