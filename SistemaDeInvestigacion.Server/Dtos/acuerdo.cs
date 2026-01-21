namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createAcuerdoDto
    {
        public required string titulo { get; set; }
        public required string descripcion { get; set; }
        public required string detallesDescripcion { get; set; }
        public required DateTime fechaVencimiento { get; set; }
        public required string estado { get; set; }
        public required string pdfUrl { get; set; }
        public required string imagenUrl { get; set; }
        public required Boolean habilitado {  get; set; }
        public required string svgEditado { get; set; }
        public required string svgOriginal { get; set; }
    }
}
