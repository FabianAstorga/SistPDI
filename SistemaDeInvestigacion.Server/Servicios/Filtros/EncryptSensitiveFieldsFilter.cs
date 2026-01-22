using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SistemaDeInvestigacion.Server.Servicios;
using System.Collections;
using System.Reflection;

namespace SistemaDeInvestigacion.Server.Servicios.Filtros
{
    public sealed class EncryptSensitiveFieldsFilter : IAsyncResultFilter
    {
        private readonly IPayloadEncryptedService _crypto;

        public EncryptSensitiveFieldsFilter(IPayloadEncryptedService crypto)
        {
            _crypto = crypto;
        }

        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            if (context.Result is ObjectResult obj && obj.Value != null)
            {
                EncryptObject(obj.Value, depth: 0);
            }

            await next();
        }

        private void EncryptObject(object obj, int depth)
        {
            if (depth > 6) return;
            if (obj is string) return;

            // Colecciones (List<DTO>, arrays, etc.)
            if (obj is IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                {
                    if (item != null) EncryptObject(item, depth + 1);
                }
                return;
            }

            var type = obj.GetType();
            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!prop.CanRead || !prop.CanWrite) continue;

                bool isSensitive = prop.GetCustomAttribute<SensitiveAttribute>() != null;

                // ✅ SOLO typeof(string)
                if (isSensitive && prop.PropertyType == typeof(string))
                {
                    var current = prop.GetValue(obj) as string;
                    if (string.IsNullOrEmpty(current)) continue;

                    if (!_crypto.IsEncrypted(current))
                    {
                        var encrypted = _crypto.Encrypt(current);
                        prop.SetValue(obj, encrypted);
                    }

                    continue;
                }

                // Objetos anidados
                if (prop.PropertyType.IsClass && prop.PropertyType != typeof(string))
                {
                    var child = prop.GetValue(obj);
                    if (child != null) EncryptObject(child, depth + 1);
                }
            }
        }
    }
}
