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
        [HttpGet("obtenerTemplates")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> ObtenerTemplates()
        {
            var listaSvg = await _context.SvgTemplates
                .Where(s => s.IdEstado == 1)
                .ToListAsync();
            return Ok(listaSvg);
        }

        [Authorize]
        [HttpGet("obtenerBorradores")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> ObtenerBorradores()
        {
            var userId = User.GetUserId();

            var listaSvg = await _context.AcuerdosUserTemplates
                .Where(relacion => relacion.IdUsuario == userId) 
                .Select(relacion => relacion.SvgTemplate)        
                .Where(svg => svg.IdEstado == 2)                
                .ToListAsync();

            return Ok(listaSvg);
        }

        [Authorize]
        [HttpGet("devolverSvg")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> devolverSvg(int idSvg)
        {
            var listaSvg = await _context.SvgTemplates.FirstOrDefaultAsync(s => s.Id == idSvg);

            return Ok(listaSvg.SvgEditado);
        }

        [Authorize]
        [HttpPost("crear")]
        public async Task<IActionResult> CrearSvg([FromBody] CreateSvgDto createSvgDto)
        {
            var userId = User.GetUserId();
            var svgNuevo = new SvgTemplate
            {
                SvgOriginal = createSvgDto.svg_original,
                IdEstado = 1,
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

    }

}
