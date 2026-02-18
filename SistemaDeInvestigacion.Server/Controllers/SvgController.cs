using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using System.Security.Claims;

namespace SistemaDeInvestigacion.Server.Controllers
{

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

        //obtiene los templates del svg
        [Authorize]
        [HttpGet("obtenerTemplates")]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> ObtenerTemplates()
        {
            var listaSvg = await _context.SvgTemplates
                .Where(s => s.IdEstado == 3)
                .ToListAsync();
            return Ok(listaSvg);
        }

        [Authorize]
        [HttpGet("svgAcuerdo/{idAcuerdo}")]
        public async Task<ActionResult> GetSvgPorAcuerdo(int idAcuerdo)
        {
            var svg = await _context.Set<SvgTemplate>()
                .Where(c => _context.Set<AcuerdosUsersTemplates>()
                    .Any(b => b.IdAcuerdo == idAcuerdo && b.IdSvg == c.Id))
                .Select(c => c.SvgEditado)
                .FirstOrDefaultAsync();
            return Ok(new { svg_editado = svg });
        }

        //obtiene los borradores de CADA USUARIO
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


        //devuelve SVG editado
        [HttpGet("devolverSvg")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> devolverSvg(int idSvg)
        {
            var listaSvg = await _context.SvgTemplates.FirstOrDefaultAsync(s => s.Id == idSvg);

            return Ok(listaSvg.SvgEditado);
        }

        //devuelve SVG original
        [HttpGet("darTemplate/{idSvg}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SvgTemplate>>> darTemplate(int idSvg)
        {
            var listaSvg = await _context.SvgTemplates.FirstOrDefaultAsync(s => s.Id == idSvg);
            if (listaSvg.IdEstado != 3)
            {
                return BadRequest("Svg seleccionado no es un template");
            }

            return Ok(listaSvg.SvgOriginal);
        }

        //crea un template
        [Authorize]
        [HttpPost("crearTemplate")]
        public async Task<IActionResult> CrearSvg([FromBody] CreateSvgDto createSvgDto)
        {
            var userId = User.GetUserId();
            var svgNuevo = new SvgTemplate
            {
                SvgOriginal = createSvgDto.svg_original,
                IdEstado = 3,
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
