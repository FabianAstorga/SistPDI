using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var userId = User.GetUserId();
            var userRole = User.GetUserRole();
            if (userId == null) {
                return NotFound(new
                {
                    message = "Usuario no autenticado"
                });
            }

            if (userRole != 1) {
                return NotFound(
                    new
                    {
                       message = "Usuario no es Super-Admin"
                    }
                    );
            }
            return await _context.Users.ToListAsync();
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        [Authorize]
        [HttpPut()]
        public async Task<IActionResult> UpdateUser([FromForm] UpdateUserDto updateUserDto)
        {

            var userId = User.GetUserId();

            var user = await _context.Users.FindAsync(userId);

            if (updateUserDto.Nombre != null)
            {
                user.Nombre = updateUserDto.Nombre;
            }

            if (updateUserDto.Mail != null)
            {
                user.Mail = updateUserDto.Mail;
            }

            if (updateUserDto.Contrasena != null)
            {
                user.Contrasena = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Contrasena);
            }

            user.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<User>> CreateUser([FromForm] CreateUserDto users)
        {
            var userRole = User.GetUserRole();

            if (userRole != 1)
            {
                return BadRequest("No es SuperAdministrador");
            }

            var UserDto = users;
            var hashPass = BCrypt.Net.BCrypt.HashPassword(users.Contrasena);
            var nuevoUser = new User
            {
                Nombre = UserDto.Nombre,
                Mail = UserDto.Mail,
                Contrasena = hashPass,
                Rol = UserDto.Rol,
                FechaActualizacion = DateTime.UtcNow
            };
            _context.Users.Add(nuevoUser);
            await _context.SaveChangesAsync();
            return Ok(new { 
                Message = "Usuario creado correctamente"
            });
        }
    }
}