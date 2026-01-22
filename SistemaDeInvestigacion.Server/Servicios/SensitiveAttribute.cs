using System;

namespace SistemaDeInvestigacion.Server.Servicios
{
    [AttributeUsage(AttributeTargets.Property)]
    public sealed class SensitiveAttribute : Attribute { }
}
