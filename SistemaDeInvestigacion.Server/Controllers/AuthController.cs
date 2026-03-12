using MailKit;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MimeKit;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
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
        //logea al sistema
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {

            var Login = loginRequest;

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
                    rol = userAuth.Rol,
                    idUsuario = userAuth.IdPersona,
                    rut = userAuth.Rut
                }
            });
        }

//Envia correo de recuperacion de contraseña
        [HttpPost("enviar")]
        public async Task<IActionResult> recuperarContrasena([FromForm] RequireMail updatePassDto)
        {
            var userData = updatePassDto;

            var userAuth = await _context.Users
                .Include(u => u.Funcionarios)
                .FirstOrDefaultAsync(u => u.Funcionarios != null && u.Funcionarios.CorreoElectronico == userData.Email);

            if (userAuth == null)
            {
                return Ok();
            }

            string RanCode = new Random().Next(100000, 999999).ToString();

            var mailer = new AuthMailService();
            await mailer.SendCode(userData.Email, RanCode);

            var newPassAtempt = new ReinicioContrasena
            {
                IdPersona = (int)userAuth.IdPersona,
                Codigo = RanCode,
                FechaCreacion = DateTime.UtcNow

            };

            _context.ReinicioContrasena.Add(newPassAtempt);
            await _context.SaveChangesAsync();
            return Ok();
        }

//comprueba el codigo enviado por el correo
        [HttpPost("comprobar")]
        public async Task<IActionResult> comprobarCorreo([FromForm] UpdatePassDto updatePassDto)
        {
            var userData = updatePassDto;

            var userAuthId = await _context.Users
                .Include(u => u.Funcionarios)
                .FirstOrDefaultAsync(u => u.Funcionarios != null && u.Funcionarios.CorreoElectronico == userData.Email);

            if (userAuthId == null)
            {
                return Ok();
            }

            var resetRequest = await _context.ReinicioContrasena
                .FirstOrDefaultAsync(rc => rc.IdPersona == userAuthId.IdPersona && rc.Codigo == updatePassDto.Code);

            if (resetRequest == null)
            {
                return BadRequest("El código es inválido para este usuario.");
            }

            if (resetRequest.FechaCreacion < DateTime.Now.AddMinutes(-5))
            {
                _context.ReinicioContrasena.Remove(resetRequest);
                await _context.SaveChangesAsync();
                return BadRequest("El código ha expirado.");
            }

            userAuthId.Contrasena = BCrypt.Net.BCrypt.HashPassword(userData.Password);
            _context.Entry(userAuthId).Property(u => u.Contrasena).IsModified = true;
            await _context.SaveChangesAsync();
            return Ok("Contraseña cambiada correctamente");

        }

    }

}