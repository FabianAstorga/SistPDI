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

            var borradorNuevo = new AcuerdosUsersTemplates
            {
                IdUsuario = userId,
                IdSvg = svgNuevo.Id
            };

            _context.AcuerdosUserTemplates.Add(borradorNuevo);
            await _context.SaveChangesAsync();
            return Ok(new { id = svgNuevo.Id });

        }

        [Authorize]
        [HttpGet("obtenerSvg")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> ObtenerSvgs()
        {
            var listaSvg = await _context.SvgTemplates
                .Where(s => s.Estado == true)
                .ToListAsync();
            return Ok(listaSvg);
        }

    }


}
