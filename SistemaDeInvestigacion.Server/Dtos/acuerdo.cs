namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createAcuerdoDto
    {
        public required string titulo { get; set; }
        public required string descripcion { get; set; }
        public required string detallesDescripcion { get; set; }
        public required DateTime fechaVencimiento { get; set; }
        public required int idCategoria { get; set; }
        public required int idEmpresa { get; set; }
        public List<int>? idsUnidades { get; set; }
        public required string svgEditado { get; set; }
        public string? svgOriginal { get; set; }
    }

    public class editAcuerdoDto
    {
        public string? titulo { get; set; }
        public string? descripcion { get; set; }
        public string? detallesDescripcion { get; set; }
        public int? idCategoria { get; set; }
        public string? svg_editado { get; set; }
        public DateTime? fechaVencimiento { get; set; }
    }
}
