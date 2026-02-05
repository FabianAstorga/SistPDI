using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateUnidadDto
    {
        [Required]
        public required string Nombre {  get; set; }
    }
}
