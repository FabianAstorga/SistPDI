using Microsoft.AspNetCore.Http;
namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateEmpresaDto
    {
        public required string nombre { get; set; }
        public required string descripcion { get; set; }
        public required IFormFile? logo { get; set; }
        public required string sitioWeb { get; set; }
        public string? email { get; set; }
        public int? telefono { get; set; }
        public required string direccion { get; set; }
    }

    public class EditEmpresaDto
    {
        public string? nombre { get; set; }
        public string? descripcion { get; set; }
        public IFormFile? logo { get; set; }
        public string? sitioWeb { get; set; }
        public string? email { get; set; }
        public int? telefono { get; set; }
        public string? direccion { get; set; }
    }
}
