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

        [Authorize]
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategoria()
        {
            var categorias = await _context.Categoria.ToListAsync();
            if (categorias == null) return StatusCode(404, "No hay ninguna Categoria");
            return categorias;
        }

        [HttpPost]
        public async Task<ActionResult<Categoria>> CreateCategoria([FromForm] CreateCategoriaDto createCategoriaDto)
        {
            var NewCategoria = new Categoria { 
                TipoCategoria = createCategoriaDto.DetalleCategoria
            };

            _context.Categoria.Add(NewCategoria);
            await _context.SaveChangesAsync();
            return (Ok("Categoria creada Correctamente"));
        }

    }
}
