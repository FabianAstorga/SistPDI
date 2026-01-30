using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;


namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class EmpresaController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public EmpresaController(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment env)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
        }

        [Authorize]
        [HttpGet("{idEmpresa}")]
        public async Task<ActionResult<Empresas>> GetEmpresa(int IdEmpresa)
        {
            var empresa = await _context.Empresas.FindAsync(IdEmpresa);
            if (empresa == null) return StatusCode(404, "No hay ninguna Empresa");
            return empresa;
        }

        [Authorize]
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Empresas>>> GetEmpresas()
        {
            var empresas = await _context.Empresas.ToListAsync();
            if (empresas == null) return StatusCode(404, "No hay ninguna Empresa");
            return empresas;
        }


        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarInstitucion([FromForm] CreateEmpresaDto createEmpresaDto)
        {
            string dbroute = null;
            if (createEmpresaDto.logo != null && createEmpresaDto.logo.Length > 0)
            {
 
                string carpetaImagenes = Path.Combine(_env.ContentRootPath, "LogosMedia");
                Console.WriteLine("Carpeta:", carpetaImagenes);
                if (!Directory.Exists(carpetaImagenes))
                {
                    Directory.CreateDirectory(carpetaImagenes);
                }

                string extension = Path.GetExtension(createEmpresaDto.logo.FileName);
                string name = createEmpresaDto.nombre.Replace(" ", "_").ToLower();
                string filename = $"logo-{name}{extension}";
                string routecomplete = Path.Combine(carpetaImagenes, filename);
                Console.WriteLine($"{routecomplete}");


                using (var stream = new FileStream(routecomplete, FileMode.Create))
                {
                    await createEmpresaDto.logo.CopyToAsync(stream);
                }

                dbroute = $"/imagenes/{filename}";

                }

            Console.WriteLine("Nombre del archivo: ", dbroute);
            var newEmpresa = new Empresas
            {
                
                Nombre = createEmpresaDto.nombre,
                Descripcion = createEmpresaDto.descripcion,
                Logo = dbroute,
                SitioWeb = createEmpresaDto.sitioWeb,
                Telefono = createEmpresaDto.telefono,
                Direccion = createEmpresaDto.direccion,
                FechaCreacion = DateTime.UtcNow,
                Email = createEmpresaDto.email,
                IdEstado = 1
            };

            _context.Empresas.Add(newEmpresa);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = "Empresa creada correctamente"
            });
        
            
            }
/*
        [HttpPatch("Editar/{idEmpresa}")]
        public async Task<ActionResult> EditEmpresa
        {

        }
*/
            
    }

   
}
