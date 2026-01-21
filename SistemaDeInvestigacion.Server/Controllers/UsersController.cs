using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [HttpPost]
        public async Task<ActionResult<User>> CrearUsuario([FromForm] createEmpleados empleadoDto)
        {
            var userId = User.GetUserId();

            if (userId != 1)
            {
                return BadRequest("Usuario no es SuperAdministrador");
            }

            var empleado = empleadoDto;

            bool rutExiste = await _context.Empleados.AnyAsync(x => x.Rut == empleado.Rut);

            if (!rutExiste)
            {
                BadRequest("Rut no existente");
            }

            var NewEmpleado = new User
            {
                FechaCreacion = DateTime.UtcNow,
                Rut = empleado.Rut,
                Rol = empleado.Rol,
                Contrasena = BCrypt.Net.BCrypt.HashPassword(empleado.Contrasena),
            };
            Console.WriteLine("OLA LLEGUE ACA");
            _context.Users.Add(NewEmpleado);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Usuario Nuevo Creado" });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> TenerUsuario(int id)
        {
            var UserData = await _context.Users.FindAsync(id);

            if (UserData == null)
            {
                return NotFound();
            }
            return Ok(UserData);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetEmpleados()
        {
            Console.WriteLine("ola");
            return await _context.Users.ToListAsync();
        }

    }
}
