namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateComentarioDto
    {
        public required int idAcuerdo { get; set; }

        public required string Comentario { get; set; }

        public string? NombreUsuario { get; set; }

    }
}
