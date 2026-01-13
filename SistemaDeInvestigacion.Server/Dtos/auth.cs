namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateUserDto
    {
        public required string Nombre { get; set; }
        public required string Mail { get; set; }
        public required string Contrasena { get; set; }
    }
}