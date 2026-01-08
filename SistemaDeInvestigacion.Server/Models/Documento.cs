using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace SistemaDeInvestigacion.Server.Models
{
    [Table("documentos")]
    public class Documento
    {
        [Key][Column("id")] public int Id { get; set; }
        [Column("convenio_id")] public int ConvenioId { get; set; }
        [Column("name")] public required string Name { get; set; }
        [Column("url")] public required string Url { get; set; }
    }
}
