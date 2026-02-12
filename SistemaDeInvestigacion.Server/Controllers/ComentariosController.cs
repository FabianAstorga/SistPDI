using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Hubs;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComentariosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHubContext<ComentariosHub> _hubContext;

        public ComentariosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //obtiene comentarios
        [HttpGet("{idAcuerdo}")]
        public async Task<ActionResult<IEnumerable<Comentarios>>> getComentarios(int idAcuerdo)
        {
            var comentarios = await _context.Comentarios
                .Where(c => c.IdAcuerdo == idAcuerdo)
                .ToListAsync();
            return Ok(comentarios);
        }

        //crea comentarios
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

        //elimina comentarios
        [Authorize]
        [HttpDelete("eliminar/{idComentario}")]
        public async Task<ActionResult<Comentarios>> deleteComentario(int idComentario){
            var comentariosData = await _context.Comentarios.FindAsync(idComentario);
            _context.Comentarios.Remove(comentariosData);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
