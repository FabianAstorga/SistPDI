using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SkiaSharp;
using SkiaSharp.Extended.Svg; 
using System.IO;
namespace SistemaDeInvestigacion.Server.Controllers
{

    /*
     * Cosas que hacer: permitir eliminar y editar un acuerdo (eliminacion con ocnfirmaciòn previa)
     * Se debe de enviar un correo
     * 
     * 
     * 
     * 
     * 
     */

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
            {
                return BadRequest("Empresa no existente");
            }

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

            using (var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(acuerdos.svgEditado)))
            {
                var skSvg = new SkiaSharp.Extended.Svg.SKSvg();
                skSvg.Load(stream);

                int width = (int)skSvg.Picture.CullRect.Width;
                int height = (int)skSvg.Picture.CullRect.Height;

                using (var bitmap = new SKBitmap(width, height))
                using (var canvas = new SKCanvas(bitmap))
                {
                    canvas.Clear(SKColors.Transparent);
                    canvas.DrawPicture(skSvg.Picture);

                    using (var image = SKImage.FromBitmap(bitmap))
                    using (var data = image.Encode(SKEncodedImageFormat.Png, 100))
                    using (var outputStream = System.IO.File.OpenWrite(fileFullPath))
                    {
                        data.SaveTo(outputStream);
                    }
                }
            }

            NewAcuerdo.ImagenUrl = $"/{folderRelativePath}/{fileName}".Replace("\\", "/");
            await _context.SaveChangesAsync();

            var acuerdoId = NewAcuerdo.IdAcuerdo;

            var NewSvg = new SvgTemplate
            {
                SvgEditado = acuerdos.svgEditado,
                SvgOriginal = acuerdos.svgOriginal,
                Estado = true,
                FechaCreacion = DateTime.UtcNow

            };

            _context.SvgTemplates.Add(NewSvg);
            await _context.SaveChangesAsync();

            var SvgId = NewSvg.Id;

            var NewDatos = new AcuerdosUsersTemplates
            {
                IdUsuario = userId,
                IdAcuerdo = NewAcuerdo.IdAcuerdo,
                IdSvg = SvgId
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
