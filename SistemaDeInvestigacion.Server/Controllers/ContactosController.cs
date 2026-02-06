using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql.Replication.PgOutput.Messages;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    //como obtengo el contacto de una empresa en un acuerdo?
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

        //obtiene los contactos de una empresa
        [HttpGet("{idEmpresa}")]
        public async Task<ActionResult<IEnumerable<Contacto>>> GetContactos(int idEmpresa)
        {
            var listaContactos = await _context.AcuerdoContactos
                .Where(ac => ac.IdEmpresa == idEmpresa)
                .Select(ac => ac.Contacto)
                .ToListAsync();
            return Ok(listaContactos);
        }

        //crea contacto de una empresa
        [Authorize]
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

        //edita un contacto de una empresa
        [Authorize]
        [HttpPatch("editar")]
        public async Task<IActionResult> EditarContacto(int idContacto, editContactoDto editContactoDto)
        {
            var contactosData = editContactoDto;
            var contactoBDData = await _context.Contactos.FindAsync(idContacto);

            if (contactosData.Nombre != null) {
                contactoBDData.Nombre = contactosData.Nombre;
            }

            if (contactosData.Numero != null)
            {
                contactoBDData.Numero = contactosData.Numero;
            }
            
            if (contactosData.Email != null)
            {
                contactoBDData.Email = contactosData.Email;
            }

            _context.Contactos.Update(contactoBDData);
            return NoContent();

        }


    }
}
