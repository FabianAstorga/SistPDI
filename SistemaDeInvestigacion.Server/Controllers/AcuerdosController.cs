using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Hubs;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Servicios;
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
        private readonly AuthMailService _authMailService;
        private readonly SvgRenderService _svgService;
        private readonly IHubContext<AcuerdosHub> _hubContext;

        public AcuerdosController(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment env, AuthMailService authMailService, SvgRenderService svgService, IHubContext<AcuerdosHub> hubContext)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
            _authMailService = authMailService;
            _svgService = svgService;
            _hubContext = hubContext;
        }


        //Muestra el detalle de un acuerdo
        [HttpGet("{id}")]
        public async Task<ActionResult<Acuerdo>> GetAcuerdos(int id)
        {
            var acuerdos = await _context.Acuerdos
                .Where(a => a.IdAcuerdo == id)
                .Select(a => new {
                    DatosAcuerdo = a,
                    IdSvg = _context.AcuerdosUserTemplates
                                .Where(t => t.IdAcuerdo == a.IdAcuerdo)
                                .Select(t => t.IdSvg)
                                .FirstOrDefault()
                })
                .FirstOrDefaultAsync();
            if (acuerdos == null) return StatusCode(404, "No hay ningún Acuerdo");
            return Ok(acuerdos);
        }


        //lista ultimos 10 acuerdos
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

        //lista los acuerdos habilitados
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetAcuerdos()
        {
            var acuerdoslista = await _context.Acuerdos
                .Where(acuerdos => acuerdos.IdEstado == 1)
                .ToListAsync();
            return Ok(acuerdoslista);
        }

        //lista TODOS los acuerdos (Habilitados y no habilitados)
        [Authorize]
        [HttpGet("listado")]
        public async Task<ActionResult<IEnumerable<Acuerdo>>> GetListado()
        {
            var acuerdoslista = await _context.Acuerdos.ToListAsync();
            return Ok(acuerdoslista);
        }

        //crea un acuerdo
        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarAcuerdo([FromForm] createAcuerdoDto AcuerdoDto)
        {
            var userId = User.GetUserId();
            var acuerdos = AcuerdoDto;

            if (string.IsNullOrWhiteSpace(acuerdos.svgEditado))
                return BadRequest("svgEditado es requerido.");

            var userRole = User.GetUserRole();
            if (userRole == null) {return BadRequest("Usuario no tiene un rol definido");};

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
                byte[] imageData = _svgService.RenderToPng(acuerdos.svgEditado);
                await System.IO.File.WriteAllBytesAsync(rutaArchivoFisica, imageData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error procesando SVG con el servicio: {ex.Message}");
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

            _context.AcuerdosUserTemplates.Add(NewDatos);
            await _context.SaveChangesAsync();

            try
            {
                var query = _context.Funcionarios.AsQueryable();

                if (acuerdos.idsUnidades != null && acuerdos.idsUnidades.Contains(0))
                {
                    Console.WriteLine("Notificando a toda la institución.");
                }
                else if (acuerdos.idsUnidades != null && acuerdos.idsUnidades.Any())
                {
                    query = query.Where(f => acuerdos.idsUnidades.Contains(f.idUnidad));
                }
                else
                {
                    query = query.Where(f => false);
                }

                var destinatarios = await query
                    .Select(f => new { f.CorreoElectronico, f.NombreCompleto })
                    .ToListAsync();

                if (destinatarios.Any())
                {

                    var SvgContenido = acuerdos.svgEditado;
                    var emailTasks = destinatarios.Select(func =>
                        _authMailService.SendMailAcuerdo(
                            func.CorreoElectronico,
                            NewAcuerdo.Titulo,
                            NewAcuerdo.Descripcion,
                            rutaArchivoFisica
                        ));

                    await Task.WhenAll(emailTasks);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en proceso de notificaciones: {ex.Message}");
            }
            await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");
            return Ok(new { Message = "Acuerdo Creado", Url = NewAcuerdo.ImagenUrl });
        }

        //Edita un acuerdo
        [Authorize]
        [HttpPatch("editar/{idAcuerdo}")]
        public async Task<IActionResult> PutAcuerdo(int idAcuerdo, [FromForm] editAcuerdoDto editAcuerdoDto)
        {
            var user = User.GetUserId();
            Console.WriteLine("Llege hasta aca");

            var template = await _context.AcuerdosUserTemplates
                    .FirstOrDefaultAsync(t => t.IdAcuerdo == idAcuerdo);

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

            if (editAcuerdoDto.fechaVencimiento.HasValue)
                acuerdo.FechaVencimiento = DateTime.SpecifyKind(editAcuerdoDto.fechaVencimiento.Value, DateTimeKind.Utc);


            acuerdo.FechaActualizacion = DateTime.UtcNow;

            var svgFuente = await _context.SvgTemplates.FindAsync(template.IdSvg);
            Console.Write(svgFuente.SvgEditado);


            string fileName = $"acuerdo_{Guid.NewGuid().ToString().Substring(0, 8)}.png";

            string rutaCarpetaFisica = Path.Combine(_env.ContentRootPath, "media", "acuerdosmedia", acuerdo.IdAcuerdo.ToString());

            if (!Directory.Exists(rutaCarpetaFisica))
                Directory.CreateDirectory(rutaCarpetaFisica);

            
            string rutaArchivoFisica = Path.Combine(rutaCarpetaFisica, fileName);
            try
            {
                byte[] imageData = _svgService.RenderToPng(svgFuente.SvgEditado);
                await System.IO.File.WriteAllBytesAsync(rutaArchivoFisica, imageData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error procesando SVG en edición: {ex.Message}");
            }

            acuerdo.ImagenUrl = $"/media/acuerdosmedia/{acuerdo.IdAcuerdo}/{fileName}";
            await _context.SaveChangesAsync();


            
            _context.Acuerdos.Update(acuerdo);
            await _context.SaveChangesAsync();
            

            var NewSvg = new SvgTemplate
            {
                SvgOriginal = svgFuente.SvgEditado,
                SvgEditado = editAcuerdoDto.svg_editado,
                FechaCreacion = DateTime.UtcNow,
                IdEstado = svgFuente.IdEstado
                
            };

            _context.SvgTemplates.Update(NewSvg);
            await _context.SaveChangesAsync();

            var infoSvgAcuerdo = _context.AcuerdosUserTemplates
                .Where(a => a.IdAcuerdo == idAcuerdo) .FirstOrDefault();
               
            infoSvgAcuerdo.IdSvg = NewSvg.Id;


            _context.AcuerdosUserTemplates.Update(infoSvgAcuerdo);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");
            return NoContent();

        }

        //Alterna acuerdo (habilitado pasa a deshabilitado y viceversa)
        [Authorize]
        [HttpPatch("alternar/{idAcuerdo}")]
        public async Task<ActionResult<Acuerdo>> alternarAcuerdo(int idAcuerdo)
        {
            var acuerdoData = await _context.Acuerdos.FindAsync(idAcuerdo);
            if (acuerdoData.IdEstado == 1)
            {
                acuerdoData.IdEstado = 2;
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");
                return NoContent();
            }

            if (acuerdoData.IdEstado == 2)
            {
                acuerdoData.IdEstado = 1;
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");
                return NoContent();
            }

            return BadRequest("Error en el alternado de la empresa");
        }


    }
}
