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

        //retorna detalles de una empresa
        [Authorize]
        [HttpGet("{idEmpresa}")]
        public async Task<ActionResult<Empresas>> GetEmpresa(int IdEmpresa)
        {
            var empresa = await _context.Empresas.FindAsync(IdEmpresa);
            if (empresa == null) return StatusCode(404, "No hay ninguna Empresa");
            return empresa;
        }

        //retorna lista de empresas HABILITADAS
        [Authorize]
        [HttpGet()]
        public async Task<ActionResult<IEnumerable<Empresas>>> GetEmpresas()
        {
            var empresas = await _context.Empresas
                .Where(empresas => empresas.IdEstado == 1)
                .ToListAsync();
            if (empresas == null) return StatusCode(404, "No hay ninguna Empresa");
            return empresas;
        }

        //retorna lista de empresas GENERAL
        [Authorize]
        [HttpGet("listado")]
        public async Task<ActionResult<IEnumerable<Empresas>>> GetListado()
        {
            var empresas = await _context.Empresas.ToListAsync();
            return empresas;
        }

        //permite crear una empresa
        [Authorize]
        [HttpPost("crear")]
        public async Task<ActionResult<Acuerdo>> PublicarInstitucion([FromForm] CreateEmpresaDto createEmpresaDto)
        {
            string dbroute = null;
            if (createEmpresaDto.logo != null && createEmpresaDto.logo.Length > 0)
            {

                string carpetaImagenes = Path.Combine(_env.ContentRootPath, "LogosMedia");
                if (!Directory.Exists(carpetaImagenes))
                {
                    Directory.CreateDirectory(carpetaImagenes);
                }

                string extension = Path.GetExtension(createEmpresaDto.logo.FileName);
                string name = createEmpresaDto.nombre.Replace(" ", "_").ToLower();
                string filename = $"logo-{name}{extension}";
                string routecomplete = Path.Combine(carpetaImagenes, filename);


                using (var stream = new FileStream(routecomplete, FileMode.Create))
                {
                    await createEmpresaDto.logo.CopyToAsync(stream);
                }

                dbroute = $"/imagenes/{filename}";

            }

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

        //alterna una empresa (de habilitado a deshabilitado y viceversa)
        [Authorize]
        [HttpPatch("alternar/{idEmpresa}")]
        public async Task<ActionResult> deshabilitarEmpresa(int idEmpresa)
        {
            var empresa = await _context.Empresas.FindAsync(idEmpresa);
            if (empresa.IdEstado == 1)
            {
                empresa.IdEstado = 2;
                await _context.SaveChangesAsync();
                return NoContent();
            }

            if (empresa.IdEstado == 2)
            {
                empresa.IdEstado = 1;
                await _context.SaveChangesAsync();
                return NoContent();
            }

            return BadRequest("Error en el alternado de la empresa");
        }

        //permite editar una empresa
        [Authorize]
        [HttpPatch("editar/{idEmpresa}")]
        public async Task<ActionResult> EditEmpresa(int idEmpresa, EditEmpresaDto editEmpresaDto)
        {
            var newData = editEmpresaDto;
            var dataBDEmpresa = await _context.Empresas.FindAsync(idEmpresa);

            if (newData.nombre != null) {dataBDEmpresa.Nombre = newData.nombre;}

            if (newData.email != null) {dataBDEmpresa.Email = newData.email;}

            if (newData.direccion != null) {dataBDEmpresa.Direccion = newData.direccion;}

            if (newData.sitioWeb != null) {dataBDEmpresa.SitioWeb = newData.sitioWeb;}

            if (newData.descripcion != null) {dataBDEmpresa.Descripcion = newData.descripcion;}

            if (newData.telefono.HasValue) { dataBDEmpresa.Telefono = newData.telefono;}

            string dbroute = null;

            if (newData.logo != null && newData.logo.Length > 0)
            {

                string carpetaImagenes = Path.Combine(_env.ContentRootPath, "LogosMedia");
                if (!Directory.Exists(carpetaImagenes))
                {
                    Directory.CreateDirectory(carpetaImagenes);
                }

                string extension = Path.GetExtension(newData.logo.FileName);
                string name = dataBDEmpresa.Nombre.Replace(" ", "_").ToLower();
                string filename = $"logo-{name}{extension}";
                string routecomplete = Path.Combine(carpetaImagenes, filename);
                using (var stream = new FileStream(routecomplete, FileMode.Create))
                {
                    await newData.logo.CopyToAsync(stream);
                }

                dbroute = $"/imagenes/{filename}";

                dataBDEmpresa.Logo = dbroute;
            }

            _context.Empresas.Update(dataBDEmpresa);
            await _context.SaveChangesAsync();
            return Ok();
        }

    }
            
}

   
