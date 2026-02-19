using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace SistemaDeInvestigacion.Hubs
{
    public class ComentariosHub : Hub
    {
        public async Task UnirseAGrupoAcuerdo(int idAcuerdo)
        {
            string nombreGrupo = $"Acuerdo_{idAcuerdo}";
            await Groups.AddToGroupAsync(Context.ConnectionId, nombreGrupo);
        }

        public async Task SalirDeGrupoAcuerdo(int idAcuerdo)
        {
            string nombreGrupo = $"Acuerdo_{idAcuerdo}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, nombreGrupo);
        }
    }
}