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

    public class InstitucionesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public InstitucionesController(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment env)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
        }

        [Authorize]
        [HttpGet("{idInstitucion}")]
        public async Task<ActionResult<Institucion>> GetInstitucion(int idInstitucion)
        {
            var institucion = await _context.Instituciones.FindAsync(idInstitucion);
            if (institucion == null) return StatusCode(404, "No hay ninguna institucion");
            return institucion;
        }


        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarInstitucion([FromForm] CreateInstitucionesDto createInstitucionesDto)
        {
            string dbroute = null;
            if (createInstitucionesDto.logo != null && createInstitucionesDto.logo.Length > 0)
            {
 
                string carpetaImagenes = Path.Combine(_env.ContentRootPath, "LogosMedia");
                Console.WriteLine("Carpeta:", carpetaImagenes);
                if (!Directory.Exists(carpetaImagenes))
                {
                    Directory.CreateDirectory(carpetaImagenes);
                }

                string extension = Path.GetExtension(createInstitucionesDto.logo.FileName);
                string name = createInstitucionesDto.nombre.Replace(" ", "_").ToLower();
                string filename = $"logo-{name}{extension}";
                string routecomplete = Path.Combine(carpetaImagenes, filename);
                Console.WriteLine($"{routecomplete}");


                using (var stream = new FileStream(routecomplete, FileMode.Create))
                {
                    await createInstitucionesDto.logo.CopyToAsync(stream);
                }

                dbroute = $"/imagenes/{filename}";

                }

            Console.WriteLine("Nombre del archivo: ", dbroute);
            var nuevaInstitucion = new Institucion
            {
                Nombre = createInstitucionesDto.nombre,
                Descripcion = createInstitucionesDto.descripcion,
                Logo = dbroute,
                SitioWeb = createInstitucionesDto.sitioWeb,
                Telefono = createInstitucionesDto.telefono,
                Direccion = createInstitucionesDto.direccion,
                FechaCreacion = DateTime.UtcNow,
                Email = createInstitucionesDto.email
            };

            _context.Instituciones.Add(nuevaInstitucion);
            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = "Institucion creada correctamente"
            });
        
            
            }
            
    }
}
