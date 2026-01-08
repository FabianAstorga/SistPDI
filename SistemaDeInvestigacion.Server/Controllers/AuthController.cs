using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            var usuarioEncontrado = await _context.Users
                                          .FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            if (usuarioEncontrado == null)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

//            bool passValida = BCrypt.Net.BCrypt.Verify(loginRequest.Password, usuarioEncontrado.Password);
//
//            if (!passValida)
//            {
//                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
//            }

            return Ok(new
            {
                User = new
                {
                    Name = usuarioEncontrado.Name,
                    Email = usuarioEncontrado.Email
                }
            });
        }
    }
}