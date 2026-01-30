using Microsoft.AspNetCore.Mvc;

namespace SistemaDeInvestigacion.Server.Controllers
{
    public class ComentariosController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
