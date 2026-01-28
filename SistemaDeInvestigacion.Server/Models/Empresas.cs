using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("Empresas")]
    public class Empresas
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("IdEmpresa")]
        public int IdEmpresa { get; set; }

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

        [Column("IdEstado")]
        public int? IdEstado { get; set; }

        [Column("FechaCreacion")]
        public DateTime? FechaCreacion { get; set; }

        [Column("FechaActualizacion")]
        public DateTime? FechaActualizacion { get; set; }

        [ForeignKey("IdEstado")]
        public virtual Estados? Estados { get; set; }
    }
}