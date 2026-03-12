using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using SistemaDeInvestigacion.Hubs;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Dtos;
using SistemaDeInvestigacion.Server.Models;
using SistemaDeInvestigacion.Server.Servicios;
using Svg;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text.Json;

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
        private readonly IHubContext<AcuerdosHub> _hubContext;
        private readonly SistemaDeInvestigacion.Server.Servicios.SvgRenderService _svgService;
        private readonly IMemoryCache _cache;
        private static CancellationTokenSource 
        _resetCacheToken = new CancellationTokenSource();
        private const string AcuerdosHabilitados = "AcuerdosHabilitados";
        private const string AcuerdosRecientes = "AcuerdosRecientes";
        private const string AcuerdosListados = "AcuerdosListados";

        public AcuerdosController(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment env, AuthMailService authMailService, SvgRenderService svgService, IHubContext<AcuerdosHub> hubContext, IMemoryCache cache)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
            _authMailService = authMailService;
            _svgService = svgService;
            _hubContext = hubContext;
            _cache = cache;
        }

        //crear petición para actualizar estados

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
        public async Task<ActionResult<IEnumerable<getAcuerdoDto>>> GetMejores()
        {
            if (!_cache.TryGetValue(AcuerdosRecientes, out List<getAcuerdoDto> acuerdos))
            {
                acuerdos = await _context.Acuerdos
                    .Where(a => a.IdEstado == 1)
                    .OrderByDescending(x => x.FechaCreacion)
                    .Take(10)
                    .Select(a => new getAcuerdoDto
                    {
                        IdAcuerdo = a.IdAcuerdo,
                        Titulo = a.Titulo,
                        Descripcion = a.Descripcion,
                        DetallesDescripcion = a.DetallesDescripcion,
                        FechaVencimiento = a.FechaVencimiento,
                        IdEstado = a.IdEstado,
                        ImagenUrl = a.ImagenUrl,
                        FechaCreacion = a.FechaCreacion,
                        FechaActualizacion = a.FechaActualizacion,
                        IdEmpresa = a.IdEmpresa,
                        NombreCategoria = a.Categoria.TipoCategoria
                    })
                    .ToListAsync();

                var cacheOption = new MemoryCacheEntryOptions()
                    .AddExpirationToken(new CancellationChangeToken(_resetCacheToken.Token))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(60));

                _cache.Set(AcuerdosRecientes, acuerdos, cacheOption);
            }

            return Ok(acuerdos);
        }

        //lista los acuerdos habilitados
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<getAcuerdoDto>>> GetAcuerdos()
        {
            if (!_cache.TryGetValue(AcuerdosHabilitados, out List<getAcuerdoDto> acuerdoslista))
            {
                acuerdoslista = await _context.Acuerdos
                    .Where(a => a.IdEstado == 1)
                    .Select(a => new getAcuerdoDto
                    {
                        IdAcuerdo = a.IdAcuerdo,
                        Titulo = a.Titulo,
                        Descripcion = a.Descripcion,
                        DetallesDescripcion = a.DetallesDescripcion,
                        FechaVencimiento = a.FechaVencimiento,
                        IdEstado = a.IdEstado,
                        ImagenUrl = a.ImagenUrl,
                        FechaCreacion = a.FechaCreacion,
                        FechaActualizacion = a.FechaActualizacion,
                        IdEmpresa = a.IdEmpresa,
                        NombreCategoria = a.Categoria.TipoCategoria
                    })
                    .ToListAsync();

                var cacheOption = new MemoryCacheEntryOptions()
                    .AddExpirationToken(new CancellationChangeToken(_resetCacheToken.Token))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(60));

                _cache.Set(AcuerdosHabilitados, acuerdoslista, cacheOption);
            }

            return Ok(acuerdoslista);
        }

        //lista TODOS los acuerdos (Habilitados y no habilitados)
        [Authorize]
        [HttpGet("listado")]
        public async Task<ActionResult<IEnumerable<getAcuerdoDto>>> GetListado()
        {
            var UserRole = User.GetUserRole();

            if (!_cache.TryGetValue(AcuerdosListados, out List<getAcuerdoDto> acuerdoslista))
            {
                acuerdoslista = await _context.Acuerdos
                    .Select(a => new getAcuerdoDto
                    {
                        IdAcuerdo = a.IdAcuerdo,
                        Titulo = a.Titulo,
                        Descripcion = a.Descripcion,
                        DetallesDescripcion = a.DetallesDescripcion,
                        FechaVencimiento = a.FechaVencimiento,
                        IdEstado = a.IdEstado,
                        ImagenUrl = a.ImagenUrl,
                        FechaCreacion = a.FechaCreacion,
                        FechaActualizacion = a.FechaActualizacion,
                        IdEmpresa = a.IdEmpresa,
                        NombreCategoria = a.Categoria.TipoCategoria
                    })
                    .ToListAsync();

                var cacheOption = new MemoryCacheEntryOptions()
                    .AddExpirationToken(new CancellationChangeToken(_resetCacheToken.Token))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(60));

                _cache.Set(AcuerdosListados, acuerdoslista, cacheOption);
            }

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
            if (userRole == null) return BadRequest("Usuario no tiene un rol definido");

            var NewAcuerdo = new Acuerdo
            {
                Titulo = acuerdos.titulo,
                Descripcion = acuerdos.descripcion,
                DetallesDescripcion = acuerdos.detallesDescripcion,
                FechaVencimiento = acuerdos.fechaVencimiento,
                IdEstado = 1,
                FechaCreacion = DateTime.UtcNow,
                IdEmpresa = acuerdos.idEmpresa,
                IdCategoria = acuerdos.idCategoria,
            };

            _context.Acuerdos.Add(NewAcuerdo);
            await _context.SaveChangesAsync();
            var auditAcuerdo = new acuerdosAuditoria
            {
                idpersona = userId,
                accion = "INSERT | Se creó un acuerdo",
                fechacambio = DateTime.UtcNow,
                idacuerdo = NewAcuerdo.IdAcuerdo,
                valornuevo = JsonSerializer.Serialize(new { NewAcuerdo.Titulo, NewAcuerdo.IdEmpresa, NewAcuerdo.IdCategoria })
            };
            _context.AcuerdosAuditoria.Add(auditAcuerdo);

            string fileName = $"acuerdo_{Guid.NewGuid().ToString().Substring(0, 8)}.jpg";
            string rutaCarpetaFisica = Path.Combine(_env.ContentRootPath, "media", "acuerdosmedia", NewAcuerdo.IdAcuerdo.ToString());

            if (!Directory.Exists(rutaCarpetaFisica))
                Directory.CreateDirectory(rutaCarpetaFisica);

            string rutaArchivoFisica = Path.Combine(rutaCarpetaFisica, fileName);

            try
            {
                byte[] imageData = _svgService.RenderToJpg(acuerdos.svgEditado);
                await System.IO.File.WriteAllBytesAsync(rutaArchivoFisica, imageData);

                NewAcuerdo.ImagenUrl = $"/media/acuerdosmedia/{NewAcuerdo.IdAcuerdo}/{fileName}";
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generando la imagen: {ex.Message}");
            }

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
                if (acuerdos.idsUnidades != null && acuerdos.idsUnidades.Any() && !acuerdos.idsUnidades.Contains(0))
                {
                    query = query.Where(f => acuerdos.idsUnidades.Contains(f.idUnidad));
                }
                else if (acuerdos.idsUnidades == null || !acuerdos.idsUnidades.Any())
                {
                    query = query.Where(f => false);
                }

                var destinatarios = await query
                    .Select(f => new { f.CorreoElectronico, f.NombreCompleto })
                    .ToListAsync();

                if (destinatarios.Any())
                {
                    int sizeLote = 50;
                    var lotesDeDestinatarios = destinatarios.Chunk(sizeLote).ToList();

                    var tareasLotes = lotesDeDestinatarios.Select(async (lote) =>
                    {
                        foreach (var func in lote)
                        {
                            try
                            {
                                await _authMailService.SendMailAcuerdo(
                                    func.CorreoElectronico,
                                    NewAcuerdo.Titulo,
                                    NewAcuerdo.Descripcion,
                                    rutaArchivoFisica
                                );
                                await RegistarLogEnvio(NewAcuerdo.IdAcuerdo, func.CorreoElectronico, NewAcuerdo.Titulo, true);
                            }
                            catch (Exception mailEx)
                            {
                                await RegistarLogEnvio(NewAcuerdo.IdAcuerdo, func.CorreoElectronico, NewAcuerdo.Titulo, false, mailEx.Message);
                            }
                        }
                    });

                    await Task.WhenAll(tareasLotes);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en proceso de notificaciones: {ex.Message}");
            }

            _resetCacheToken.Cancel();
            _resetCacheToken.Dispose();
            _resetCacheToken = new CancellationTokenSource();

            await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");

            return Ok(new { Message = "Acuerdo Creado", Url = NewAcuerdo.ImagenUrl });
        }


        private async Task RegistarLogEnvio(int idAcuerdo, string correo, string titulo, bool exitoso, string error = "")
        {
                string folderPath = Path.Combine(_env.ContentRootPath, "logs", "envios_acuerdos");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                string fileName = $"log_acuerdo_{idAcuerdo}.txt";
                string filePath = Path.Combine(folderPath, fileName);

                string estado = exitoso ? "EXITOSO" : $"FALLIDO - {error}";
                string linea = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] | Correo: {correo} | Título: {titulo} | Estado: {estado}{Environment.NewLine}";

                await System.IO.File.AppendAllTextAsync(filePath, linea);

                LimpiarLogsAntiguos(folderPath, 10);
        }

        private void LimpiarLogsAntiguos(string folderPath, int maxArchivos)
        {
                var archivos = new DirectoryInfo(folderPath).GetFiles("*.txt")
                                    .OrderByDescending(f => f.LastWriteTime)
                                    .ToList();

                if (archivos.Count > maxArchivos)
                {
                    var archivosParaEliminar = archivos.Skip(maxArchivos);
                    foreach (var archivo in archivosParaEliminar)
                    {
                        archivo.Delete();
                    }
                }
        }

        //Edita un acuerdo
        [Authorize]
        [HttpPatch("editar/{idAcuerdo}")]
        public async Task<IActionResult> PutAcuerdo(int idAcuerdo, [FromForm] editAcuerdoDto editAcuerdoDto)
        {
            var userId = User.GetUserId();

            var template = await _context.AcuerdosUserTemplates
                    .FirstOrDefaultAsync(t => t.IdAcuerdo == idAcuerdo);

            if (template == null || template.IdSvg == null)
            {
                return BadRequest("No se encontró el template o el SVG asociado a este acuerdo.");
            }

            var acuerdo = await _context.Acuerdos.FindAsync(idAcuerdo);
            if (acuerdo == null) return NotFound("Acuerdo no encontrado");

            var estadoAnteriorAcuerdo = JsonSerializer.Serialize(new
            {
                acuerdo.Titulo,
                acuerdo.Descripcion,
                acuerdo.DetallesDescripcion,
                acuerdo.IdCategoria,
                acuerdo.IdEstado,
                acuerdo.FechaVencimiento
            });

            if (!string.IsNullOrEmpty(editAcuerdoDto.titulo))
                acuerdo.Titulo = editAcuerdoDto.titulo;

            if (!string.IsNullOrEmpty(editAcuerdoDto.descripcion))
                acuerdo.Descripcion = editAcuerdoDto.descripcion;

            if (!string.IsNullOrEmpty(editAcuerdoDto.detallesDescripcion))
                acuerdo.DetallesDescripcion = editAcuerdoDto.detallesDescripcion;

            if (editAcuerdoDto.idCategoria.HasValue)
                acuerdo.IdCategoria = editAcuerdoDto.idCategoria;

            if (editAcuerdoDto.fechaVencimiento.HasValue)
                acuerdo.FechaVencimiento = DateTime.SpecifyKind(editAcuerdoDto.fechaVencimiento.Value, DateTimeKind.Utc);

            acuerdo.FechaActualizacion = DateTime.UtcNow;

            var auditAcuerdo = new acuerdosAuditoria
            {
                idpersona = userId,
                accion = "UPDATE | Modificación de acuerdo",
                fechacambio = DateTime.UtcNow,
                idacuerdo = acuerdo.IdAcuerdo,
                valorantiguo = estadoAnteriorAcuerdo,
                valornuevo = JsonSerializer.Serialize(new
                {
                    acuerdo.Titulo,
                    acuerdo.Descripcion,
                    acuerdo.DetallesDescripcion,
                    acuerdo.IdCategoria,
                    acuerdo.IdEstado,
                    acuerdo.FechaVencimiento
                })
            };
            _context.AcuerdosAuditoria.Add(auditAcuerdo);

            if (!string.IsNullOrEmpty(editAcuerdoDto.svg_editado))
            {
                var svgFuente = await _context.SvgTemplates.FindAsync(template.IdSvg);
                if (svgFuente == null) return BadRequest("No se encontró el SVG original para editar.");

                var valorAntiguoSvg = svgFuente.SvgEditado;

                string fileName = $"acuerdo_{Guid.NewGuid().ToString().Substring(0, 8)}.png";
                string rutaCarpetaFisica = Path.Combine(_env.ContentRootPath, "media", "acuerdosmedia", acuerdo.IdAcuerdo.ToString());

                if (!Directory.Exists(rutaCarpetaFisica))
                    Directory.CreateDirectory(rutaCarpetaFisica);

                string rutaArchivoFisica = Path.Combine(rutaCarpetaFisica, fileName);

                try
                {
                    byte[] imageData = _svgService.RenderToJpg(editAcuerdoDto.svg_editado);
                    await System.IO.File.WriteAllBytesAsync(rutaArchivoFisica, imageData);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Error generando imagen del acuerdo editado: {ex.Message}");
                }

                acuerdo.ImagenUrl = $"/media/acuerdosmedia/{acuerdo.IdAcuerdo}/{fileName}";

                var NewSvg = new SvgTemplate
                {
                    SvgOriginal = svgFuente.SvgEditado,
                    SvgEditado = editAcuerdoDto.svg_editado,
                    FechaCreacion = DateTime.UtcNow,
                    IdEstado = svgFuente.IdEstado
                };

                _context.SvgTemplates.Add(NewSvg);
                await _context.SaveChangesAsync();

                var auditSvg = new svgAuditoria
                {
                    idpersona = userId,
                    accion = $"UPDATE | Nueva versión de SVG para acuerdo {acuerdo.IdAcuerdo}",
                    fechacambio = DateTime.UtcNow,
                    idsvg = NewSvg.Id,
                    valorantiguo = valorAntiguoSvg,
                    valornuevo = NewSvg.SvgEditado
                };
                _context.SvgAuditoria.Add(auditSvg);

                template.IdSvg = NewSvg.Id;
                _context.AcuerdosUserTemplates.Update(template);
            }

            _context.Acuerdos.Update(acuerdo);
            await _context.SaveChangesAsync();

            _resetCacheToken.Cancel();
            _resetCacheToken.Dispose();
            _resetCacheToken = new CancellationTokenSource();

            await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");

            return NoContent();
        }

        [Authorize]
        [HttpPatch("alternar/{idAcuerdo}")]
        public async Task<ActionResult<Acuerdo>> alternarAcuerdo(int idAcuerdo)
        {
            var userId = User.GetUserId();
            var acuerdoData = await _context.Acuerdos.FindAsync(idAcuerdo);

            if (acuerdoData == null) return NotFound("Acuerdo no encontrado");
            int estadoAnterior = acuerdoData.IdEstado;

            if (acuerdoData.IdEstado == 1)
            {
                acuerdoData.IdEstado = 2;
            }
            else if (acuerdoData.IdEstado == 2)
            {
                acuerdoData.IdEstado = 1;
            }
            else
            {
                return BadRequest("Error en el alternado del acuerdo");
            }

            var auditoria = new acuerdosAuditoria
            {
                idpersona = userId,
                accion = $"PATCH | Estado de {estadoAnterior} => {acuerdoData.IdEstado}",
                fechacambio = DateTime.UtcNow,
                idacuerdo = idAcuerdo,
                valorantiguo = JsonSerializer.Serialize(new { IdEstado = estadoAnterior }),
                valornuevo = JsonSerializer.Serialize(new { IdEstado = acuerdoData.IdEstado })
            };

            _context.AcuerdosAuditoria.Add(auditoria);

            await _context.SaveChangesAsync();
            _resetCacheToken.Cancel();
            _resetCacheToken.Dispose();
            _resetCacheToken = new CancellationTokenSource();
            await _hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos");

            return NoContent();
        }
    }
}
