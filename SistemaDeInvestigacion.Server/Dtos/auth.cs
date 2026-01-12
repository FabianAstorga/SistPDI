namespace SistemaDeInvestigacion.Server.Dtos
{
    public class CreateUserDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required DateTime EmailVerifiedAt { get; set; }
        public required string Password { get; set; }
        public required string RememberToken { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required DateTime UpdatedAt { get; set; }
    }
}