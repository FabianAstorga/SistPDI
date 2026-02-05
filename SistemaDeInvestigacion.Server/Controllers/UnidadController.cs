using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Servicios;
using SkiaSharp;
using Svg.Skia;
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

        [HttpGet]
        public async Task<ActionResult<Unidad>> GetUnidades()
        {
            var listaUnidades = _context.Unidades.ToListAsync();
            return Ok(listaUnidades);
        }

        /*
        [HttpPost]
        public async Task<Action<Unidad>> PostUnidad(CreateUnidadDto createUnidadDto)
        {
            var newUnidad = new Unidad { Nombre = createUnidadDto.Nombre };
            _context.Unidades.Add(newUnidad);
            await _context.SaveChangesAsync();
            return Ok();

        }
        */
    }
}
