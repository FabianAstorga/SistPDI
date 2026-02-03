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

        [HttpPatch]
        public async Task<ActionResult> UpdateUser(UpdateUserDto updateUserDto)
        {
            var usuarioExistente = await _context.Users.FindAsync(updateUserDto.IdPersona);

            if (usuarioExistente == null) return NotFound("Usuario no encontrado");

            if (!string.IsNullOrEmpty(updateUserDto.Rut))
                usuarioExistente.Rut = updateUserDto.Rut;

            if (updateUserDto.Rol.HasValue && updateUserDto.Rol > 0)
                usuarioExistente.Rol = updateUserDto.Rol.Value;

            if (!string.IsNullOrEmpty(updateUserDto.Contrasena))
            {

                bool esMismaPassword = BCrypt.Net.BCrypt.Verify(updateUserDto.Contrasena, usuarioExistente.Contrasena);
                if (!esMismaPassword)
                {
                    usuarioExistente.Contrasena = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Contrasena);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Usuario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar: {ex.Message}");
            }
        }
    }
}

