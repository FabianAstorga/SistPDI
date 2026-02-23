using Microsoft.AspNetCore.DataProtection;
using System.Security.Cryptography;
using System.Text;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public interface IPayloadEncryptedService
    {
        string? Encrypt(string? plaintext);
        string? EncryptDeterministic(string? plaintext);
        string? Decrypt(string? storedValue);
        bool IsEncrypted(string? value);
    }

    public sealed class PayloadCryptoService : IPayloadEncryptedService
    {
        private readonly IDataProtector _protector;
        private readonly byte[] _deterministicKey;
        private const string Purpose = "Investigacion.PDI.V1";

        public PayloadCryptoService(IDataProtectionProvider provider, IConfiguration config)
        {
            // Protector rotativo (para Nombres, Correos, etc.)
            _protector = provider.CreateProtector(Purpose);

            // Llave fija derivada de appsettings para el RUT (Determinístico)
            var masterKey = config["Crypto:MasterKey"] ?? "Clave-Temporal-Seguridad-2026";
            _deterministicKey = SHA256.HashData(Encoding.UTF8.GetBytes(masterKey));
        }

        public string? Encrypt(string? plaintext)
        {
            if (string.IsNullOrWhiteSpace(plaintext)) return plaintext;
            return _protector.Protect(plaintext);
        }

        public string? EncryptDeterministic(string? plaintext)
        {
            if (string.IsNullOrWhiteSpace(plaintext)) return plaintext;

            using var aes = Aes.Create();
            aes.Key = _deterministicKey;
            // IV fijo basado en la llave para que el mismo texto siempre de el mismo cifrado
            aes.IV = SHA256.HashData(_deterministicKey).Take(16).ToArray();

            using var encryptor = aes.CreateEncryptor();
            byte[] inputBytes = Encoding.UTF8.GetBytes(plaintext);
            byte[] cipherBytes = encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);

            return "DET:" + Convert.ToBase64String(cipherBytes);
        }

        public string? Decrypt(string? storedValue)
        {
            if (string.IsNullOrWhiteSpace(storedValue)) return storedValue;

            try
            {
                // Intenta descifrar formato determinístico
                if (storedValue.StartsWith("DET:"))
                {
                    var cipherText = storedValue.Replace("DET:", "");
                    using var aes = Aes.Create();
                    aes.Key = _deterministicKey;
                    aes.IV = SHA256.HashData(_deterministicKey).Take(16).ToArray();

                    using var decryptor = aes.CreateDecryptor();
                    byte[] cipherBytes = Convert.FromBase64String(cipherText);
                    byte[] plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
                    return Encoding.UTF8.GetString(plainBytes);
                }

                // Intenta descifrar formato rotativo de Microsoft
                return _protector.Unprotect(storedValue);
            }
            catch
            {
                // Si no puede (datos viejos o sin cifrar), devuelve el valor original
                return storedValue;
            }
        }

        public bool IsEncrypted(string? value) =>
            !string.IsNullOrEmpty(value) && (value.StartsWith("DET:") || value.Length > 50);
    }
}