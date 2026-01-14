using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;


namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class InstitucionesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // GET: InstitucionesController

        public InstitucionesController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{idInstitucion}")]
        public async Task<ActionResult<Institucion>> GetInstitucion(int idInstitucion)
        {
            var institucion = await _context.Instituciones.FindAsync(idInstitucion);
            if (institucion == null) return StatusCode(404, "No hay ninguna institucion");
            return institucion;
        }

        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarInstitucion([FromForm] CreateInstitucionesDto createInstitucionesDto)
        {
            var nuevaInstitucion = new Institucion
            {
                Nombre = createInstitucionesDto.nombre,
                Descripcion = createInstitucionesDto.descripcion,
                Logo = createInstitucionesDto.logo,
                SitioWeb = createInstitucionesDto.email,
                Telefono = createInstitucionesDto.telefono,
                Direccion = createInstitucionesDto.direccion,
                FechaCreacion = DateTime.UtcNow,
                Email = createInstitucionesDto.email
            };

            _context.Instituciones.Add(nuevaInstitucion);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = "Institucion creada correctamente"
            });
        }
    }
}
