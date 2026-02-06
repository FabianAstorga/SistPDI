using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public CategoriaController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //Obtiene datos de UNA categoria


        [HttpGet("categoria/{idCategoria}")]
        public async Task<ActionResult<Categoria>> GetCategoria(int idCategoria)
        {
            var CategoriaData = await _context.Categoria.FindAsync(idCategoria);
            if (CategoriaData == null) { 
                return StatusCode(404, "No hay ninguna Categoria"); 
            };
            return CategoriaData;
        }

        //obtiene categorias HABILITADAS
        [Authorize]
        [HttpGet("categorias")]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategoria()
        {
            var categorias = await _context.Categoria
                .Where(a => a.IdEstado == 1)
                .ToListAsync();
            if (categorias == null) return StatusCode(404, "No hay ninguna Categoria");
            return categorias;
        }

        //obtiene TODAS las categorias
        [Authorize]
        [HttpGet("lista")]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategoriaListada()
        {
            var categorias = await _context.Categoria.ToListAsync();
            if (categorias == null) return StatusCode(404, "No hay ninguna Categoria");
            return categorias;
        }

        //crea una categoria nueva
        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Categoria>> CreateCategoria([FromForm] CreateCategoriaDto createCategoriaDto)
        {
            var NewCategoria = new Categoria {
                TipoCategoria = createCategoriaDto.DetalleCategoria,
                IdEstado = 1
            };

            _context.Categoria.Add(NewCategoria);
            await _context.SaveChangesAsync();
            return (Ok("Categoria creada Correctamente."));
        }

        //Modifica una categoria existente
        [Authorize]
        [HttpPatch("modificar/{idCategoria}")]
        public async Task<ActionResult<Categoria>> AlternarCategoria(int idCategoria, EditCategoriaDto editCategoriaDto)
        {
            var newCategoria = editCategoriaDto;
            var categoria = await _context.Categoria.FindAsync(idCategoria);
            categoria.TipoCategoria = newCategoria.DetalleCategoria;
            await _context.SaveChangesAsync();
            return (Ok(new { message = "Categoria actualizada Correctamente."}));
        }

        //Alterna una categoria
        [Authorize]
        [HttpPatch("alternar/{idCategoria}")]
        public async Task<ActionResult<Categoria>> AlternarCategoria(int idCategoria)
        {
            var categoriaData = await _context.Categoria.FindAsync(idCategoria);
            if (categoriaData.IdEstado == 1)
            {
                categoriaData.IdEstado = 2;
                await _context.SaveChangesAsync();
                return NoContent();
            }

            if (categoriaData.IdEstado == 2)
            {
                categoriaData.IdEstado = 1;
                await _context.SaveChangesAsync();
                return NoContent();
            }

            return BadRequest("Error en el alternado de la categoria");
        }

    }
}
