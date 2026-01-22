using Microsoft.AspNetCore.Mvc.Filters;
using SistemaDeInvestigacion.Server.Servicios;
using System.Collections;
using System.Reflection;

namespace SistemaDeInvestigacion.Server.Servicios.Filtros
{
    public sealed class DecryptSensitiveFieldsFilter : IAsyncActionFilter
    {
        private readonly IPayloadEncryptedService _crypto;

        public DecryptSensitiveFieldsFilter(IPayloadEncryptedService crypto)
        {
            _crypto = crypto;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            foreach (var arg in context.ActionArguments.Values)
            {
                if (arg is null) continue;
                DecryptObject(arg, depth: 0);
            }

            await next();
        }

        private void DecryptObject(object obj, int depth)
        {
            if (depth > 6) return;     // protección básica
            if (obj is string) return;

            // Si es una lista (List<DTO>, array, etc.)
            if (obj is IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                {
                    if (item != null) DecryptObject(item, depth + 1);
                }
                return;
            }

            var type = obj.GetType();
            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!prop.CanRead || !prop.CanWrite) continue;

                bool isSensitive = prop.GetCustomAttribute<SensitiveAttribute>() != null;

                // Solo strings marcados como [Sensitive]
                if (isSensitive && (prop.PropertyType == typeof(string) || prop.PropertyType == typeof(string?)))
                {
                    var current = prop.GetValue(obj) as string;
                    if (string.IsNullOrEmpty(current)) continue;

                    if (_crypto.IsEncrypted(current))
                    {
                        var plain = _crypto.Decrypt(current);
                        prop.SetValue(obj, plain);
                    }

                    continue;
                }

                // Objetos anidados
                if (prop.PropertyType.IsClass && prop.PropertyType != typeof(string))
                {
                    var child = prop.GetValue(obj);
                    if (child != null) DecryptObject(child, depth + 1);
                }
            }
        }
    }
}
