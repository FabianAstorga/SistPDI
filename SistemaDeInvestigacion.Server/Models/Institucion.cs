using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("instituciones")]
    public class Institucion
    {
        [Key]
        [Column("IdInstitucion")]
        public int IdInstitucion { get; set; }

        [Column("Nombre")]
        public required string Nombre { get; set; }

        [Column("Descripcion")]
        public string? Descripcion { get; set; }

        [Column("Logo")]
        public string? Logo { get; set; }

        [Column("SitioWeb")]
        public string? SitioWeb { get; set; }

        [Column("Email")]
        public string? Email { get; set; }

        [Column("Telefono")]
        public int? Telefono { get; set; }

        [Column("Direccion")]
        public string? Direccion { get; set; }

        [Column("FechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("FechaActualizacion")]
        public DateTime? FechaActualizacion { get; set; }
    }
}