using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Servicios;
using System.ComponentModel.DataAnnotations;

namespace SistemaDeInvestigacion.Server.Dtos
{
    public class createEmpleadoDto
    {
        [Required]
        public required string rut { get; set; }

        [Required]
        public required string CorreoElectronico { get; set; }

        [Required]
        public required string NombreCompleto { get; set; }

    }

    public class editEmpleadoDto
    {
        public string? rut { get; set; }

        public string? CorreoElectronico { get; set; }

        public string? NombreCompleto { get; set; }

        public int? idUnidad { get; set; }


    }

}
