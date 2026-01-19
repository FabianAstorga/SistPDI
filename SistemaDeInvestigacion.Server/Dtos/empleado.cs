using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createEmpleadoDto
    {
        [Required]
        public required string Nombre { get; set; }
        
        [Required]
        public required string Rut { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Mail { get; set; }
       
        public string? brigada { get; set; }

        public string? cargo { get; set; }

        public int? telefono { get; set; }
    }
}
