using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComentariosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        public ComentariosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{idAcuerdo}")]
        public async Task<ActionResult<IEnumerable<Comentarios>>> getComentarios(int idAcuerdo)
        {
            var comentarios = await _context.Comentarios
                .Where(c => c.IdAcuerdo == idAcuerdo)
                .ToListAsync();
            return Ok(comentarios);
        }

        [HttpPost("crear")]
        public async Task<ActionResult<Comentarios>> createComentario([FromForm] CreateComentarioDto createComentarioDto)
        {
            var comentariosData = createComentarioDto;
            if (comentariosData.NombreUsuario == null)
            {
                comentariosData.NombreUsuario = "Usuario Anónimo";
            }
            var nuevoComentario = new Comentarios
            {
                IdAcuerdo = comentariosData.idAcuerdo,
                NombreUsuario = comentariosData.NombreUsuario,
                Comentario = comentariosData.Comentario
            };

            _context.Comentarios.Add(nuevoComentario);
            await _context.SaveChangesAsync();
            return Ok("Comentario creado Correctamente");
        }
    }
}
