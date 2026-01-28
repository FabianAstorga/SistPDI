using Microsoft.AspNetCore.Mvc;

namespace SistemaDeInvestigacion.Server.Controllers
{
    public class CorreosController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
