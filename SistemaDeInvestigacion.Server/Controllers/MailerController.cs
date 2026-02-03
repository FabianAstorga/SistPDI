using Microsoft.AspNetCore.Mvc;
using SistemaDeInvestigacion.Server.Data;



namespace SistemaDeInvestigacion.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailerController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public MailerController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        //TENER TODOS LOS CORREOS SE PUEDE FILTRAR POR UNIDAD
     



    }
}
