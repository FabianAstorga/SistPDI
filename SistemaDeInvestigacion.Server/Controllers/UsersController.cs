using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using System.Data;

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
        public async Task<ActionResult<User>> CrearUsuario([FromForm] CreateUserDto createUserDto)
        {
            var userId = User.GetUserId();
            var userRole = User.GetUserRole();

            if (userRole != 1)
            {
                return BadRequest("Usuario no es SuperAdministrador");
            }

            var user = createUserDto;

            bool rutExiste = await _context.Funcionarios.AnyAsync(x => x.Rut == user.Rut);

            if (!rutExiste)
            {
                BadRequest("Rut no existente");
            }

            var newUser = new User
            {
                FechaCreacion = DateTime.UtcNow,
                Rut = user.Rut,
                Rol = user.Rol,
                idEstado = 1,
                Contrasena = BCrypt.Net.BCrypt.HashPassword(user.Contrasena),
            };
            Console.WriteLine("OLA LLEGUE ACA");
            _context.Users.Add(newUser);
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
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            Console.WriteLine("ola");
            return await _context.Users.ToListAsync();
        }

        [HttpPatch]
        public async Task<ActionResult> UpdateUser(UpdateUserDto updateUserDto)
        {
            var DatosUser = await _context.Users.FindAsync(updateUserDto.IdPersona);            

            var newDatos = updateUserDto;
            if (updateUserDto.Rut == null)
            {
                newDatos.Rut = DatosUser.Rut;
            }

            if (newDatos.Rol == null)
            {
                newDatos.Rol = DatosUser.Rol;
            }

            Console.WriteLine($"Esta es la contra que me pasaron: { newDatos.Contrasena}");

            if (!string.IsNullOrEmpty(newDatos.Contrasena)) {
                Console.WriteLine("no se porque pero llegue aqui");
                bool passValida = BCrypt.Net.BCrypt.Verify(DatosUser.Contrasena, newDatos.Contrasena);
                    if (!passValida) {

                        newDatos.Contrasena = BCrypt.Net.BCrypt.HashPassword(newDatos.Contrasena);
            
                    }

            }

            await _context.SaveChangesAsync();





            return Ok();
            }

    }
}

