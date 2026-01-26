namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createAcuerdoDto
    {
        public required string titulo { get; set; }
        public required string descripcion { get; set; }
        public required string detallesDescripcion { get; set; }
        public required DateTime fechaVencimiento { get; set; }
        public required string estado { get; set; }
        public required int idEmpresa { get; set; }
        public required string svgEditado { get; set; }
        public string? svgOriginal { get; set; }
    }
}
