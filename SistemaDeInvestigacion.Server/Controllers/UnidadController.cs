using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Servicios;
using System.IO;

namespace SistemaDeInvestigacion.Server.Controllers
{

    [Route("api/[controller]")]
    public class UnidadController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UnidadController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //obtiene las unidades
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<Unidad>> GetUnidades()
        {
            var listaUnidades = await _context.Unidades.ToListAsync();
            return Ok(listaUnidades);
        }

        //crea una unidad
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PostUnidad(CreateUnidadDto createUnidadDto)
        {
            var newUnidad = new Unidad { Nombre = createUnidadDto.Nombre };
            _context.Unidades.Add(newUnidad);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Unidad Creada Correctamente" });

        }
        //borra una unidad
        [Authorize]
        [HttpDelete("borrar/{IdUnidad}")]
        public async Task<IActionResult> DeleteUnidad(int IdUnidad)
        {
            var UnidadData = await _context.Unidades.FindAsync(IdUnidad);
            _context.Unidades.Remove(UnidadData);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Unidad Eliminada Correctamente"});

        }
    }
}
