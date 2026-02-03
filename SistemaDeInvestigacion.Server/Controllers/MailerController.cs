using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;


namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailerController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public MailerController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [HttpGet("destinatarios")]
        public async Task<IActionResult> GetDestinatarios([FromQuery] int? idUnidad)
        {
            try
            {
                var query = _context.Funcionarios.AsQueryable();

                if (idUnidad.HasValue && idUnidad > 0)
                {
                    query = query.Where(f => f.idUnidad == idUnidad.Value);
                }

                var resultado = await query
                    .Select(f => new
                    {
                        f.NombreCompleto,
                        f.CorreoElectronico,
                        IdUnidad = f.idUnidad,
                        NombreUnidad = _context.Unidades
                                        .Where(u => u.idUnidad == f.idUnidad)
                                        .Select(u => u.Nombre)
                                        .FirstOrDefault()
                    })
                    .ToListAsync();

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("unidades")]
        public async Task<IActionResult> GetUnidades()
        {
            try
            {
                var unidades = await _context.Unidades
                    .Select(u => new {
                        Id = u.idUnidad,
                        Nombre = u.Nombre
                    })
                    .ToListAsync();

                return Ok(unidades);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener unidades: {ex.Message}");
            }
        }
    }
}

