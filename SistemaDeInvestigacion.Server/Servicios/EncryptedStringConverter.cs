using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public sealed class EncryptedStringConverter : ValueConverter<string?, string?>
    {
        public EncryptedStringConverter(IPayloadEncryptedService crypto)
            : base(
                v => crypto.Encrypt(v),
                v => crypto.Decrypt(v)
            )
        { }
    }

    public sealed class DeterministicEncryptedStringConverter : ValueConverter<string?, string?>
    {
        public DeterministicEncryptedStringConverter(IPayloadEncryptedService crypto)
            : base(
                v => crypto.EncryptDeterministic(v),
                v => crypto.Decrypt(v)
            )
        { }
    }
}