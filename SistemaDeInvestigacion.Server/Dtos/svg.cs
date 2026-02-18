using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateSvgDto
    {
        [Required]
        public required string svg_original { get; set; }
        [Required]
        public bool estado { get; set; }
    }

    public class EditSvgDto
    {
        [Required]
        public required int idSvg { get; set; }

        [Required]
        public required string svgOriginal { get; set; }
    }
}
