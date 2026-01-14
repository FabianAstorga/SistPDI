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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(long id, [FromForm] UpdateUserDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(long id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("crear")]
        public async Task<ActionResult<User>> CreateUser([FromForm] CreateUserDto users)
        {
            var UserDto = users;
            var hashPass = BCrypt.Net.BCrypt.HashPassword(users.Contrasena);
            var nuevoUser = new User
            {
                Nombre = UserDto.Nombre,
                Mail = UserDto.Mail,
                Contrasena = hashPass,
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