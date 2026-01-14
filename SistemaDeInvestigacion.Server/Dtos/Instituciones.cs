namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateInstitucionesDto
    {
        public required string nombre { get; set; }
        public required string descripcion { get; set; }
        public required string logo { get; set; }
        public required string sitioWeb { get; set; }
        public string? email { get; set; }
        public int? telefono { get; set; }
        public required string direccion { get; set; }
    }
}
