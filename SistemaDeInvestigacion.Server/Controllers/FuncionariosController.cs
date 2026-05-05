using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class FuncionariosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public FuncionariosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //obtiene empleados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Funcionarios>>> GetEmpleados()
        {
            return await _context.Funcionarios.ToListAsync();
        }
        //obtiene detalles de un empleado en especifico
        [HttpGet("{idPersona}")]
        public async Task<ActionResult> TenerUsuario(int idPersona)
        {
            var userID = User.GetUserId();
            var userRole = User.GetUserRole();

            if (userRole != 1) {
                return BadRequest("Usuario no es Super-Administrador");
            }

            var resultado = await _context.Users
                    .Where(u => u.IdPersona == idPersona)
                    .Select(u => new
                    {

                        u.Rol,
                        u.Rut,
                        u.FechaCreacion,

                        Correo = u.Funcionarios.CorreoElectronico,
                        Nombre = u.Funcionarios.NombreCompleto
                    })
                    .FirstOrDefaultAsync();

            if (resultado == null)
            {
                return NotFound();
            }

            return Ok(resultado);

        }

        //crea un empleado
        //[AllowAnonymous]
        [HttpPost("crear")]
        public async Task<ActionResult> crearUsuario(createEmpleadoDto createEmpleadoDto)
        {
           var userID = User.GetUserId();
            var userRole = User.GetUserRole();

            if (userRole is not( 1 or 2))
            {
                return BadRequest("Usuario no está habilitado para Agregar");
            }

            var empleadoDto = createEmpleadoDto;

            var newEmpleado = new Funcionarios
            {
                CorreoElectronico = empleadoDto.CorreoElectronico,
                Rut = empleadoDto.rut,
                NombreCompleto = empleadoDto.NombreCompleto,
                idUnidad = empleadoDto.idUnidad
            };

            _context.Funcionarios.Add(newEmpleado);
            await _context.SaveChangesAsync();
            return Ok("Funcionario creado Exitosamente");

        }

        //edita un empleado
        [HttpPatch("editar")]
        public async Task<ActionResult> ActualizarEmpleado([FromBody] editEmpleadoDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.rut))
            {
                return BadRequest("Rut debe ser existente");
            }

            var funcionario = await _context.Funcionarios
                .FirstOrDefaultAsync(f => f.Rut == dto.rut);

            if (funcionario == null)
            {
                return NotFound("No se encontró un funcionario con el rut ingresado");
            }


            if (!string.IsNullOrEmpty(dto.CorreoElectronico)) funcionario.CorreoElectronico = dto.CorreoElectronico;
            if (!string.IsNullOrEmpty(dto.NombreCompleto)) funcionario.NombreCompleto = dto.NombreCompleto;
            if (dto.idUnidad.HasValue) funcionario.idUnidad = dto.idUnidad.Value;
     
            await _context.SaveChangesAsync();
     
            return Ok(new { mensaje = "Funcionario actualizado correctamente" });
        }
    }
}
