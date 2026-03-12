using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SistemaDeInvestigacion.Hubs;
using SistemaDeInvestigacion.Server.Data;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public class AcuerdosExpirationWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AcuerdosExpirationWorker> _logger;

        public AcuerdosExpirationWorker(IServiceProvider serviceProvider, ILogger<AcuerdosExpirationWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<AcuerdosHub>>();
                        var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();

                        int filasAfectadas = await context.Database.ExecuteSqlRawAsync("CALL actualizar_acuerdos_vencidos()", stoppingToken);

                        if (filasAfectadas > 0 || filasAfectadas == -1)
                        {
                            cache.Remove("AcuerdosHabilitados");
                            cache.Remove("AcuerdosRecientes");
                            cache.Remove("AcuerdosListados");

                            await hubContext.Clients.All.SendAsync("RecibirActualizacionAcuerdos", stoppingToken);
                        }
                    }

                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }
}