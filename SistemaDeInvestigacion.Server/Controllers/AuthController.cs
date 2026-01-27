using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {

            var Login = loginRequest;

            Console.WriteLine(Login);

            var userAuth = await _context.Users
                .Include(u => u.Funcionarios)
                .FirstOrDefaultAsync(u => u.Funcionarios != null && u.Funcionarios.CorreoElectronico == loginRequest.Email);

        

            if (userAuth == null)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

            bool passValida = BCrypt.Net.BCrypt.Verify(loginRequest.Password, userAuth.Contrasena);

            if (!passValida)
            {
                return Unauthorized(new { Message = "Correo o contraseña incorrectos" });
            }

            var keyString = _configuration.GetSection("Jwt:Key").Value;
            var issuer = _configuration.GetSection("Jwt:Issuer").Value;
            var audience = _configuration.GetSection("Jwt:Audience").Value;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userAuth.IdPersona.ToString()),
                new Claim(ClaimTypes.Role, userAuth.Rol.ToString()),
                new Claim(ClaimTypes.Name, userAuth.Funcionarios?.NombreCompleto ?? "Sin Nombre"),
                new Claim(ClaimTypes.Email, userAuth.Funcionarios?.CorreoElectronico ?? ""),
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: creds
            );

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = jwtToken,
                user = new
                {
                    nombre = userAuth.Funcionarios?.NombreCompleto,
                    email = userAuth.Funcionarios?.CorreoElectronico,
                    rol = userAuth.Rol
                }
            });
        }
    }
}