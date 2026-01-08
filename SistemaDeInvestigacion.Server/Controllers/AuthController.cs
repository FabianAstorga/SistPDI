using BCrypt.Net;                    
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using SistemaDeInvestigacion.Server.Data;       

namespace TuProyecto.Server.Controllers
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
            
            var usuarioEncontrado = await _context.Usuarios
                                          .FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            
            if (usuarioEncontrado == null)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

            
            bool passValida = BCrypt.Net.BCrypt.Verify(loginRequest.Password, usuarioEncontrado.Password);

            

            if (!passValida)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

            
            return Ok(new
            {
                Token = "token_real_generado_aqui", 
                User = new
                {
                    Name = usuarioEncontrado.Nombre, 
                    Email = usuarioEncontrado.Email
                }
            });
        }
    }
}