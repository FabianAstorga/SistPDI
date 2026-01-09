using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SvgTemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SvgTemplatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SvgFiles>>> GetTemplates()
        {
            return await _context.SvgTemplates.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SvgFiles>> GetTemplate(long id)
        {
            var template = await _context.SvgTemplates.FindAsync(id);
            if (template == null) return NotFound();
            return template;
        }

        [HttpPost]
        public async Task<ActionResult<SvgFiles>> PostTemplate(SvgFiles template)
        {
            _context.SvgTemplates.Add(template);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, template);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(long id)
        {
            var template = await _context.SvgTemplates.FindAsync(id);
            if (template == null) return NotFound();
            _context.SvgTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}