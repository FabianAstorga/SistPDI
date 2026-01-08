using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConveniosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ConveniosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Convenio>>> GetConvenios()
        {
            return await _context.Convenios.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Convenio>> GetConvenio(int id)
        {
            var convenio = await _context.Convenios.FindAsync(id);
            if (convenio == null) return NotFound();
            return convenio;
        }

        [HttpPost]
        public async Task<ActionResult<Convenio>> PostConvenio(Convenio convenio)
        {
            _context.Convenios.Add(convenio);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetConvenio), new { id = convenio.Id }, convenio);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConvenio(int id)
        {
            var convenio = await _context.Convenios.FindAsync(id);
            if (convenio == null) return NotFound();
            _context.Convenios.Remove(convenio);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}