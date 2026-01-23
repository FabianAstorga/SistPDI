using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public EmpleadosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("{idPersona}")]
        public async Task<ActionResult> TenerUsuario(int idPersona)
        {
            var userID = User.GetUserId();

            if (userID != 1) {
                return BadRequest("Usuario no es Super-Administrador");
            }

            var resultado = await _context.Users
                    .Where(u => u.IdPersona == idPersona)
                    .Select(u => new
                    {

                        u.Rol,
                        u.Rut,
                        u.FechaCreacion,

                        Correo = u.Empleado.CorreoElectronico,
                        Nombre = u.Empleado.NombreCompleto
                    })
                    .FirstOrDefaultAsync();

            if (resultado == null)
            {
                return NotFound();
            }

            return Ok(resultado);

        }

        [HttpPost("crear")]
        public async Task<ActionResult> crearUsuario(createEmpleadoDto createEmpleadoDto)
        {
            var userID = User.GetUserId();
            if (userID != 1)
            {
                return BadRequest("Usuario no es SuperAdministrador");
            }
            
            var empleadoDto = createEmpleadoDto;


            var newEmpleado = new Empleado
            {
                CorreoElectronico = empleadoDto.CorreoElectronico,
                Rut = empleadoDto.rut,
                NombreCompleto = empleadoDto.NombreCompleto
            };

            _context.Empleados.Add(newEmpleado);
            await _context.SaveChangesAsync();
            return Ok("Empleado creado Exitosamente");
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetEmpleados()
        {
            Console.WriteLine("ola");
            return await _context.Users.ToListAsync();
        }

    }
}
