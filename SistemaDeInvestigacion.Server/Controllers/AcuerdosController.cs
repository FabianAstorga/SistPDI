using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SkiaSharp;
using Svg.Skia;
using System.IO;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcuerdosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public AcuerdosController(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment env)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Acuerdo>> GetAcuerdos(int id)
        {
            var acuerdos = await _context.Acuerdos.FindAsync(id);
            if (acuerdos == null) return StatusCode(404, "No hay ningún Acuerdo");
            return acuerdos;
        }

        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarAcuerdo([FromForm] createAcuerdoDto AcuerdoDto)
        {
            var userId = User.GetUserId();
            var acuerdos = AcuerdoDto;

            if (string.IsNullOrWhiteSpace(acuerdos.svgEditado))
                return BadRequest("svgEditado es requerido.");

            var userRole = User.GetUserRole();
            var habilitado = false;

            if (userRole == 1)
            {
                habilitado = true;
            }

            var NewAcuerdo = new Acuerdo
            {
                Titulo = acuerdos.titulo,
                Descripcion = acuerdos.descripcion,
                DetallesDescripcion = acuerdos.detallesDescripcion,
                FechaVencimiento = acuerdos.fechaVencimiento,
                IdEstado = 1,
                FechaCreacion = DateTime.UtcNow,
                IdEmpresa = acuerdos.idEmpresa
            };

            _context.Acuerdos.Add(NewAcuerdo);
            await _context.SaveChangesAsync();

            string fileName = $"acuerdo_{Guid.NewGuid().ToString().Substring(0, 8)}.png";

            string rutaCarpetaFisica = Path.Combine(_env.ContentRootPath, "media", "acuerdosmedia", NewAcuerdo.IdAcuerdo.ToString());

            if (!Directory.Exists(rutaCarpetaFisica))
                Directory.CreateDirectory(rutaCarpetaFisica);

            string rutaArchivoFisica = Path.Combine(rutaCarpetaFisica, fileName);

            try
            {
                var svgText = acuerdos.svgEditado.Trim();
                using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(svgText));
                var skSvg = new SKSvg();
                var picture = skSvg.Load(stream);

                if (picture == null)
                    return BadRequest("No se pudo parsear el SVG.");

                var rect = picture.CullRect;
                int width = Math.Max(1, (int)Math.Ceiling(rect.Width));
                int height = Math.Max(1, (int)Math.Ceiling(rect.Height));

                if (width <= 1 || height <= 1)
                {
                    width = 1200;
                    height = 800;
                }

                using var bitmap = new SKBitmap(width, height, SKColorType.Rgba8888, SKAlphaType.Premul);
                using var canvas = new SKCanvas(bitmap);
                canvas.Clear(SKColors.Transparent);
                canvas.DrawPicture(picture);
                canvas.Flush();

                using var image = SKImage.FromBitmap(bitmap);
                using var data = image.Encode(SKEncodedImageFormat.Png, 100);

                await using var outputStream = System.IO.File.OpenWrite(rutaArchivoFisica);
                data.SaveTo(outputStream);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error procesando SVG: {ex.Message}");
            }


            NewAcuerdo.ImagenUrl = $"/media/acuerdosmedia/{NewAcuerdo.IdAcuerdo}/{fileName}";

            await _context.SaveChangesAsync();



            var NewSvg = new SvgTemplate
            {
                SvgEditado = acuerdos.svgEditado,
                SvgOriginal = acuerdos.svgOriginal,
                IdEstado = 1,
                FechaCreacion = DateTime.UtcNow
            };

            _context.SvgTemplates.Add(NewSvg);
            await _context.SaveChangesAsync();

            var NewDatos = new AcuerdosUsersTemplates
            {
                IdUsuario = userId,
                IdAcuerdo = NewAcuerdo.IdAcuerdo,
                IdSvg = NewSvg.Id
            };

            Console.WriteLine(NewSvg.Id);
          
            _context.AcuerdosUserTemplates.Add(NewDatos);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Acuerdo Creado", Url = NewAcuerdo.ImagenUrl });
        }

        [HttpGet("mejores")]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetMejores()
        {
            var acuerdos = await _context.Acuerdos
                .Where(acuerdos => acuerdos.IdEstado == 1)
                .OrderByDescending(x => x.FechaCreacion)
                .Take(10)
                .ToListAsync();
            return Ok(acuerdos);
        }

        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetAcuerdos()
        {
            var acuerdoslista = await _context.Acuerdos
                .Where(acuerdos => acuerdos.IdEstado == 1)
                .ToListAsync();
            return Ok(acuerdoslista);
        }

        [HttpGet("pendientes")]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetPendientes()
        {
            var acuerdosPendientes = await _context.Acuerdos
                .Where(acuerdos => acuerdos.IdEstado == 1)
                .ToListAsync();
            return Ok(acuerdosPendientes);
        }

        [HttpPut("editar/{idAcuerdo}")]
        public async Task<IActionResult> PutAcuerdo(int idAcuerdo, [FromForm] editAcuerdoDto editAcuerdoDto)
        {
            var user = User.GetUserId();
            Console.WriteLine("Llege hasta aca");

            var template = await _context.AcuerdosUserTemplates
                    .FirstOrDefaultAsync(t => t.IdUsuario == user && t.IdAcuerdo == idAcuerdo);

            if (template.IdSvg == null) {
                return BadRequest("test: null");
            }

            Console.WriteLine(template.IdSvg);

            var acuerdo = await _context.Acuerdos.FindAsync(idAcuerdo);

            if (!string.IsNullOrEmpty(editAcuerdoDto.titulo)) 
                acuerdo.Titulo = editAcuerdoDto.titulo;
            
            if (!string.IsNullOrEmpty(editAcuerdoDto.descripcion)) 
                acuerdo.Descripcion = editAcuerdoDto.descripcion;
            
            if (!string.IsNullOrEmpty(editAcuerdoDto.detallesDescripcion)) 
                acuerdo.DetallesDescripcion = editAcuerdoDto.detallesDescripcion;

            if (editAcuerdoDto.idCategoria.HasValue) acuerdo.IdCategoria = editAcuerdoDto.idCategoria;
            
            if (editAcuerdoDto.fechaVencimiento.HasValue) acuerdo.FechaVencimiento = editAcuerdoDto.fechaVencimiento;

            acuerdo.FechaActualizacion = DateTime.Now;

            var svgFuente = await _context.SvgTemplates.FindAsync(template.IdSvg);
            Console.Write(svgFuente.SvgEditado);
               
            /*
            _context.Acuerdos.Update(acuerdo);
            await _context.SaveChangesAsync();
            */



            return NoContent();
        
        }
    }
}
