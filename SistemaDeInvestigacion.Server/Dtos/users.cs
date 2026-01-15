using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace SistemaDeInvestigacion.Server.Dtos

{
    public class CreateUserDto
    {
        [Required]
        public required string Nombre { get; set; }
        [Required]
        [EmailAddress]
        public required string Mail { get; set; }
        [Required]
        public required string Contrasena { get; set; }
        [Required]
        public required int Rol { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Nombre { get; set; }
        [EmailAddress]
        public string? Mail { get; set; }
        public string? Contrasena { get; set; }
    }
}