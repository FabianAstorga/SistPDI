using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Dtos;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class SvgController : Controller
    {

        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public SvgController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [Authorize]
        [HttpPost("crear")]
        public async Task<IActionResult> CrearSvg([FromBody] CreateSvgDto createSvgDto)
        {
            var userId = User.GetUserId();
            var svgNuevo = new SvgTemplate
            {
                SvgOriginal = createSvgDto.svg_original,
                Estado = createSvgDto.estado,
                SvgEditado = null,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = null
            };



            _context.SvgTemplates.Add(svgNuevo);
            await _context.SaveChangesAsync();

            var idsvg = svgNuevo.Id;
            Console.WriteLine($"___________________ este es el id :{svgNuevo.Id}");


            var borradorNuevo = new AcuerdosUsersTemplates
            {
                IdUsuario = userId,
                IdSvg = svgNuevo.Id,
                IdAcuerdo = null
            };


            _context.AcuerdosUserTemplates.Add(borradorNuevo);
            await _context.SaveChangesAsync();
            return Ok(new { id = svgNuevo.Id });

        }

        [Authorize]
        [HttpGet("obtenerTemplates")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> ObtenerTemplates()
        {
            var listaSvg = await _context.SvgTemplates
                .Where(s => s.Estado == true)
                .ToListAsync();
            return Ok(listaSvg);
        }

        [Authorize]
        [HttpGet("obtenerBorradores")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> ObtenerBorradores()
        {
            var userId = User.GetUserId();

            var listaSvg = await _context.AcuerdosUserTemplates
                .Where(relacion => relacion.IdUsuario == userId) // 1. Primero buscas en la tabla intermedia tus filas
                .Select(relacion => relacion.SvgTemplate)        // 2. De esas filas, extraes SOLAMENTE el objeto SvgTemplate real
                .Where(svg => svg.Estado == false)                // 3. Filtras que el SVG esté activo
                .ToListAsync();

            return Ok(listaSvg);
        }
    }

}
