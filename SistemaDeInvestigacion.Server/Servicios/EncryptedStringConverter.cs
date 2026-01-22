using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace SistemaDeInvestigacion.Server.Servicios
{
    // Para correo/nombre: nonce random (mejor seguridad)
    public sealed class EncryptedStringConverter : ValueConverter<string?, string?>
    {
        public EncryptedStringConverter(IPayloadEncryptedService crypto)
            : base(
                v => v == null ? null : crypto.Encrypt(v),
                v => v == null ? null : crypto.Decrypt(v)
            )
        { }
    }

    // Para RUT (PK/FK): determinístico (mismo rut => mismo cifrado)
    public sealed class DeterministicEncryptedStringConverter : ValueConverter<string, string>
    {
        public DeterministicEncryptedStringConverter(IPayloadEncryptedService crypto)
            : base(
                v => crypto.EncryptDeterministic(v)!,
                v => crypto.Decrypt(v)!
            )
        { }
    }
}
