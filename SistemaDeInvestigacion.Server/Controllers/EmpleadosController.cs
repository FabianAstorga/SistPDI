using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmpleadosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public EmpleadosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }


        [HttpPost]
        public async Task<ActionResult<Empleado>> CrearEmpleado([FromForm] createEmpleadoDto empleadoDto)
        {
            var userId = User.GetUserId();
            var empleado = empleadoDto;
            var NewEmpleado = new Empleado
            {
                NombreCompleto = empleado.Nombre,
                Rut = empleado.Rut,
                Brigada = empleado.brigada,
                Cargo = empleado.cargo,
                Telefono = empleado.telefono,
                Mail = empleado.Mail,
                idCreador = userId
            };
            Console.WriteLine("OLA LLEGUE ACA");
            _context.Empleados.Add(NewEmpleado);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Empleado Creado" });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Empleado>> TenerEmpleado(int id)
        {
            var EmpleadoData = await _context.Empleados.FindAsync(id);

            if (EmpleadoData == null)
            {
                return NotFound();
            }
            return Ok(EmpleadoData);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Empleado>>> GetEmpleados()
        {
            Console.WriteLine("ola");
            return await _context.Empleados.ToListAsync();
        }

    }
}
