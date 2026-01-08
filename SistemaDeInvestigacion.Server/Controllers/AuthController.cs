using BCrypt.Net;                    // Si usaste la librería de encriptación que hablamos
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // IMPORTANTE: Necesario para usar bases de datos
using SistemaDeInvestigacion.Server.Data;        // Donde tengas tu DbContext

namespace TuProyecto.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 1. VARIABLE PARA LA BASE DE DATOS
        private readonly ApplicationDbContext _context;

        // 2. CONSTRUCTOR: Aquí "inyectamos" la conexión a la BD
        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            // PASO A: BUSCAR EL USUARIO POR CORREO
            // "Busca en la tabla Usuarios el primero que tenga este Email"
            var usuarioEncontrado = await _context.Usuarios
                                          .FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            // PASO B: VALIDAR SI EXISTE
            if (usuarioEncontrado == null)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

            // PASO C: VERIFICAR LA CONTRASEÑA
            // OPCIÓN 1: Si usaste BCrypt (Recomendado/Profesional)
            bool passValida = BCrypt.Net.BCrypt.Verify(loginRequest.Password, usuarioEncontrado.Password);

            // OPCIÓN 2: Si NO estás encriptando (Solo texto plano - NO recomendado pero funcional)
            // bool passValida = (loginRequest.Password == usuarioEncontrado.Password);

            if (!passValida)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

            // PASO D: RETORNAR ÉXITO
            return Ok(new
            {
                Token = "token_real_generado_aqui", // Aquí luego implementaremos JWT
                User = new
                {
                    Name = usuarioEncontrado.Nombre, // O el campo que tengas
                    Email = usuarioEncontrado.Email
                }
            });
        }
    }
}