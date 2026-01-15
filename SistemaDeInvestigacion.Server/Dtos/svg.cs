using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateSvgDto
    {
        [Required]
        public required string svg_original { get; set; }
        [Required]
        public string? svg_editado { get; set; }
        [Required]
        public bool estado { get; set; }
    }
}
