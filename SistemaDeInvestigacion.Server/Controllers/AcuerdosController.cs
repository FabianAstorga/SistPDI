using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SkiaSharp;
using Svg.Skia; // ✅ CAMBIO: antes era SkiaSharp.Extended.Svg
using System.IO;

namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcuerdosController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AcuerdosController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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

            if (acuerdos.idEmpresa == null)
                return BadRequest("Empresa no existente");

            if (string.IsNullOrWhiteSpace(acuerdos.svgEditado))
                return BadRequest("svgEditado es requerido.");

            var NewAcuerdo = new Acuerdo
            {
                Titulo = acuerdos.titulo,
                Descripcion = acuerdos.descripcion,
                DetallesDescripcion = acuerdos.detallesDescripcion,
                FechaVencimiento = acuerdos.fechaVencimiento,
                Estado = acuerdos.estado,
                Habilitado = false,
                FechaCreacion = DateTime.UtcNow,
                IdEmpresa = acuerdos.idEmpresa
            };

            _context.Acuerdos.Add(NewAcuerdo);
            await _context.SaveChangesAsync();

            string folderRelativePath = Path.Combine("media", NewAcuerdo.IdAcuerdo.ToString());
            string folderFullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folderRelativePath);

            if (!Directory.Exists(folderFullPath))
                Directory.CreateDirectory(folderFullPath);

            string fileName = $"acuerdo_{Guid.NewGuid().ToString().Substring(0, 8)}.png";
            string fileFullPath = Path.Combine(folderFullPath, fileName);

            // =========================
            // ✅ SVG -> PNG con Svg.Skia
            // =========================
            try
            {
                var svgText = acuerdos.svgEditado.Trim();

                using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(svgText));

                // ✅ Namespace y tipo de Svg.Skia
                var skSvg = new SKSvg();
                var picture = skSvg.Load(stream);

                if (picture == null)
                    return BadRequest("No se pudo parsear el SVG (picture null). Revisa el contenido de svgEditado.");

                // En algunos SVG el CullRect puede quedar 0x0 si viene raro.
                var rect = picture.CullRect;
                int width = Math.Max(1, (int)Math.Ceiling(rect.Width));
                int height = Math.Max(1, (int)Math.Ceiling(rect.Height));

                // Fallback “sano” si llega 1x1 por SVG sin dimensiones útiles
                if (width <= 1 || height <= 1)
                {
                    width = 1200;
                    height = 800;
                }

                using var bitmap = new SKBitmap(width, height, SKColorType.Rgba8888, SKAlphaType.Premul);
                using var canvas = new SKCanvas(bitmap);

                canvas.Clear(SKColors.Transparent);

                // Dibuja el SVG (picture) al canvas
                canvas.DrawPicture(picture);
                canvas.Flush();

                using var image = SKImage.FromBitmap(bitmap);
                using var data = image.Encode(SKEncodedImageFormat.Png, 100);

                await using var outputStream = System.IO.File.OpenWrite(fileFullPath);
                data.SaveTo(outputStream);
            }
            catch (Exception ex)
            {
                // Si quieres, loguea el SVG completo con cuidado (puede ser gigante)
                // Console.WriteLine(acuerdos.svgEditado);

                return StatusCode(500, $"Error procesando SVG: {ex.GetType().Name} - {ex.Message}");
            }

            NewAcuerdo.ImagenUrl = $"/{folderRelativePath}/{fileName}".Replace("\\", "/");
            await _context.SaveChangesAsync();

            var NewSvg = new SvgTemplate
            {
                SvgEditado = acuerdos.svgEditado,
                SvgOriginal = acuerdos.svgOriginal,
                Estado = true,
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

            _context.AcuerdosUserTemplates.Add(NewDatos);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Acuerdo Creado" });
        }

        [HttpGet("mejores")]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetMejores()
        {
            var acuerdos = await _context.Acuerdos
                .OrderByDescending(x => x.FechaCreacion)
                .Take(10)
                .ToListAsync();
            return Ok(acuerdos);
        }

        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetAcuerdos()
        {
            return await _context.Acuerdos
                .Where(acuerdos => acuerdos.Habilitado == true)
                .ToListAsync();
        }
    }
}
