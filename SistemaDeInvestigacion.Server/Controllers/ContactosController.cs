using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Models;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Dtos;
using Npgsql.Replication.PgOutput.Messages;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public ContactosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{idEmpresa}")]
        public async Task<ActionResult<IEnumerable<Contacto>>> GetContactos(int idEmpresa)
        {
            var listaContactos = await _context.AcuerdoContactos
                .Where(ac => ac.IdEmpresa == idEmpresa)
                .Select(ac => ac.Contacto)
                .ToListAsync();
            return Ok(listaContactos);
        }

        [HttpPost("crear")]
        public async Task<ActionResult> CreateContacto([FromBody] createContactoDto createContactoDto) {
            
            if (createContactoDto.IdEmpresa == null)
            {
                return BadRequest("No se entregó un Id de Empresa");
            }
            
            var newContacto = new Contacto
                {
                    Nombre = createContactoDto.Nombre,
                    Numero = createContactoDto.Numero,
                    Email = createContactoDto.Email
                };

            _context.Contactos.Add(newContacto);
            await _context.SaveChangesAsync();

            var ContactoId = newContacto.IdContacto;

            var AContacto = new AcuerdoContacto
                {
                    IdEmpresa = createContactoDto.IdEmpresa,
                    IdContacto = (int)ContactoId
            };

            _context.AcuerdoContactos.Add(AContacto);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Contacto Creado" });
        }




    }
}
