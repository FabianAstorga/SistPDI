using Microsoft.EntityFrameworkCore;
using SistemaDeInvestigacion.Server.Data;
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddControllers();
builder.Services.AddOpenApi();
var app = builder.Build();
app.UseDefaultFiles();
app.MapStaticAssets();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); 
}
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");
app.Run();