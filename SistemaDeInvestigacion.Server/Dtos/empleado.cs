using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Servicios;
using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createEmpleados
    {
        [Required]
        public required int Rol { get; set; }
        
        [Required]
        public required string Contrasena { get; set; }
        
        [Required]
        [Sensitive] public required string Rut { get; set; }
        
    }
}
