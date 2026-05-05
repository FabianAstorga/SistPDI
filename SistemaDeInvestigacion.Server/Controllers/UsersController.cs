using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using System.Data;
using System.Net;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
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
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> TenerUsuario(int id)
        {
            var userID = User.GetUserId();
            var userRole = User.GetUserRole();

            if (userRole is not (1))
            {
                return NoContent();
            }
            var UserData = await _context.Users.FindAsync(id);

            if (UserData == null)
            {
                return NotFound();
            }
            return Ok(UserData);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            var userID = User.GetUserId();
            var userRole = User.GetUserRole();
            
            if (userRole is not (1))
            {
                return NoContent();
            }
            return await _context.Users.ToListAsync();
        }

        //[Authorize]
        [AllowAnonymous]
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
                return BadRequest("Rut no existente");
            }

            var newUser = new User
            {
                FechaCreacion = DateTime.UtcNow,
                Rut = user.Rut,
                Rol = user.Rol,
                idEstado = 1,
                Contrasena = BCrypt.Net.BCrypt.HashPassword(user.Contrasena),
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            
            var auditoria = new usersAuditoria
            {
                idpersona = userId,
                idafectado = newUser.IdPersona!.Value,
                accion = $"INSERT | Se creó un nuevo usuario con RUT: {newUser.Rut} y Rol: {newUser.Rol}",
                fechacambio = DateTime.UtcNow
            };

            _context.UsersAuditoria.Add(auditoria);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Usuario Nuevo Creado" });
            
        }

        [Authorize]
        [HttpPatch]
        public async Task<ActionResult> UpdateUser(UpdateUserDto updateUserDto)
        {
            var userID = User.GetUserId();
            var userRole = User.GetUserRole();

            if (userRole is not (1))
            {
                return BadRequest("Usuario no permitido para editar credenciales");
            }

            var usuarioExistente = await _context.Users.FindAsync(updateUserDto.IdPersona);
            if (usuarioExistente == null) return NotFound("Usuario no encontrado");
            var rolAnterior = usuarioExistente.Rol;
            var rutAnterior = usuarioExistente.Rut;
            List<string> cambiosRealizados = new List<string>();

            if (!string.IsNullOrEmpty(updateUserDto.Rut) && updateUserDto.Rut != usuarioExistente.Rut)
            {
                cambiosRealizados.Add($"RUT: {usuarioExistente.Rut} -> {updateUserDto.Rut}");
                usuarioExistente.Rut = updateUserDto.Rut;
            }

            if (updateUserDto.Rol.HasValue && updateUserDto.Rol > 0 && updateUserDto.Rol != usuarioExistente.Rol)
            {
                cambiosRealizados.Add($"ROL: {usuarioExistente.Rol} -> {updateUserDto.Rol}");
                usuarioExistente.Rol = updateUserDto.Rol.Value;
            }

            if (!string.IsNullOrEmpty(updateUserDto.Contrasena))
            {
                bool esMismaPassword = BCrypt.Net.BCrypt.Verify(updateUserDto.Contrasena, usuarioExistente.Contrasena);
                if (!esMismaPassword)
                {
                    usuarioExistente.Contrasena = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Contrasena);
                    cambiosRealizados.Add("Contraseña actualizada");
                }
            }

            try
            {
                await _context.SaveChangesAsync();

                if (cambiosRealizados.Count > 0)
                {
                    var auditoria = new usersAuditoria
                    {
                        idpersona = userID,
                        idafectado = usuarioExistente.IdPersona!.Value,
                        fechacambio = DateTime.UtcNow,
                        accion = $"UPDATE | Cambios realizados: {string.Join(", ", cambiosRealizados)}"
                    };

                    _context.UsersAuditoria.Add(auditoria);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Usuario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar: {ex.Message}");
            }
        }
    }
}

