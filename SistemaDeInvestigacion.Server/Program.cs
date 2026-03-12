using DotNetEnv;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SistemaDeInvestigacion.Hubs;
using SistemaDeInvestigacion.Server.Data;
using SistemaDeInvestigacion.Server.Servicios;
using System.Text;
using System.Text.Json.Serialization;

Env.Load();
var originsString = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
var allowedOrigins = originsString.Split(',')
                                  .Select(o => o.Trim())
                                  .ToArray();

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");


var urlDelEnv = Environment.GetEnvironmentVariable("APP_URL");

if (!string.IsNullOrEmpty(urlDelEnv))
{
    builder.WebHost.UseUrls(urlDelEnv);
}

var cryptoConnection = builder.Configuration.GetConnectionString("CryptoConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDbContext<KeysDbContext>(options =>
    options.UseNpgsql(cryptoConnection));

builder.Services.AddDataProtection()
    .PersistKeysToDbContext<KeysDbContext>()
    .SetApplicationName("Sistema-Investigacion-PDI")
    .SetDefaultKeyLifetime(TimeSpan.FromDays(7));
//.SetDefaultKeyLifetime(TimeSpan.FromDays(30));

builder.Services.AddScoped<IPayloadEncryptedService, PayloadCryptoService>();


var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,

        ValidateAudience = true,
        ValidAudience = jwtAudience,

        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddScoped<SistemaDeInvestigacion.Server.Servicios.SvgRenderService>();

builder.Services.AddControllers(options =>
{

})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header"
    });

    options.AddSecurityRequirement(doc =>
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer"),
                new List<string>()
            }
        }
    );
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddScoped<AuthMailService>();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Services.AddSignalR();
builder.Services.AddMemoryCache();
builder.Services.AddHostedService<AcuerdosExpirationWorker>();

var app = builder.Build();

app.UseDefaultFiles();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

var externalMediaPath = Path.Combine(builder.Environment.ContentRootPath, "media");
if (!Directory.Exists(externalMediaPath))
{
    Directory.CreateDirectory(externalMediaPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(externalMediaPath),
    RequestPath = "/media",
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
});

var logosPath = Path.Combine(builder.Environment.ContentRootPath, "LogosMedia");
var acuerdosPath = Path.Combine(builder.Environment.ContentRootPath, "media", "acuerdosmedia");

if (!Directory.Exists(logosPath))
{
    Directory.CreateDirectory(logosPath);
}

if (!Directory.Exists(acuerdosPath))
{
    Directory.CreateDirectory(acuerdosPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(logosPath),
    RequestPath = "/imagenes",
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(acuerdosPath),
    RequestPath = "/media",
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
});




app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.MapHub<AcuerdosHub>("/acuerdosHub");
app.MapHub<ComentariosHub>("/comentariosHub");
app.Run();