using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Dtos;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SistemaDeInvestigacion.Server.Controllers
{
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
        public async Task<ActionResult<SvgTemplate>> CrearSvg([FromBody]CreateSvgDto createSvgDto)
        {
            var userId = User.GetUserId();
            var svgNuevo = new SvgTemplate
            {
                SvgOriginal = createSvgDto.svg_original,
                Estado = createSvgDto.estado,
                SvgEditado = null,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = null,
                IdUser = userId
            };


            _context.SvgTemplates.Add(svgNuevo);
            await _context.SaveChangesAsync();
            return Ok(new {Message = "Svg creado Correctamente"});
        }
    }
}
