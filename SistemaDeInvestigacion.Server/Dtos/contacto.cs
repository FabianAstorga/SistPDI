namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createContactoDto
    {
        public required int IdEmpresa { get; set; }
        public required string Nombre {  get; set; }
        public string? Email { get; set; }
        public int? Numero { get; set; }
    }
}
