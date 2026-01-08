using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ObjetivosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ObjetivosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Objetivo>>> GetObjetivos()
        {
            return await _context.Objetivos.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Objetivo>> PostObjetivo(Objetivo objetivo)
        {
            _context.Objetivos.Add(objetivo);
            await _context.SaveChangesAsync();
            return Ok(objetivo);
        }
    }
}