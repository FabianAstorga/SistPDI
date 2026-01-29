using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
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

        [HttpPost("crear")]
        public async Task<ActionResult> crearUsuario(createEmpleadoDto createEmpleadoDto)
        {
            var userID = User.GetUserId();
            var userRole = User.GetUserRole();

            if (userRole != 1)
            {
                return BadRequest("Usuario no es SuperAdministrador");
            }

            var empleadoDto = createEmpleadoDto;

            var newEmpleado = new Funcionarios
            {
                CorreoElectronico = empleadoDto.CorreoElectronico,
                Rut = empleadoDto.rut,
                NombreCompleto = empleadoDto.NombreCompleto,

                //esto es momentaneo
                idUnidad = 1
            };

            _context.Funcionarios.Add(newEmpleado);
            await _context.SaveChangesAsync();
            return Ok("Empleado creado Exitosamente");
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Funcionarios>>> GetEmpleados()
        {
            
            Console.WriteLine("ola");
            return await _context.Funcionarios.ToListAsync();
        }

        [HttpPatch]
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
                return NotFound($"No se encontró un empleado con el rut ingresado");
            }


            if (!string.IsNullOrEmpty(dto.CorreoElectronico)) funcionario.CorreoElectronico = dto.CorreoElectronico;
            if (!string.IsNullOrEmpty(dto.NombreCompleto)) funcionario.NombreCompleto = dto.NombreCompleto;
            if (!dto.idUnidad.HasValue) funcionario.idUnidad = dto.idUnidad.Value;
     
            await _context.SaveChangesAsync();
     
            return Ok(new { mensaje = "Empleado actualizado correctamente" });
        }
    }
}
