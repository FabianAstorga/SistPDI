using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcuerdosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AcuerdosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Acuerdo>> GetAcuerdos(int id)
        {
            var acuerdos = await _context.Acuerdos.FindAsync(id);
            if (acuerdos == null) return StatusCode(404, "No hay ningún Acuerdo");
            return acuerdos;
        }

        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarAcuerdo([FromForm] acuerdoDto AcuerdoDto)
        {
            var userId = User.GetUserId();
            var acuerdos = AcuerdoDto;
            var NewAcuerdo = new Acuerdo
            {
                Titulo = acuerdos.titulo,
                Descripcion = acuerdos.descripcion,
                DetallesDescripcion = acuerdos.detallesDescripcion,
                FechaVencimiento = acuerdos.fechaVencimiento,
                Estado = acuerdos.estado,
                PDFUrl = acuerdos.pdfUrl,
                ImagenUrl = acuerdos.imagenUrl,
                Habilitado = acuerdos.habilitado,
                FechaCreacion = DateTime.UtcNow,
                IdCreador = userId,
                IdInstitucion = acuerdos.idInstitucion,
                IdSvgTemplate = acuerdos.idSvgTemplate
            };
            _context.Acuerdos.Add(NewAcuerdo);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Acuerdo Creado" });
        }

        [HttpGet("mejores")]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetMejores()
        {
            var acuerdos = await _context.Acuerdos
                .OrderByDescending(x => x.FechaCreacion)
                .Take(10)
                .ToListAsync();
            return Ok(acuerdos);
        }

        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetAcuerdos()
        {
            return await _context.Acuerdos.ToListAsync();
        }

    }


}
