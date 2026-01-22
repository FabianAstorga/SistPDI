using System.Security.Cryptography;
using System.Text;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public interface IPayloadEncryptedService
    {
        string? Encrypt(string? plaintext);
        string? Decrypt(string? storedValue);
        bool IsEncrypted(string? value);
    }

    public sealed class PayloadCryptoService : IPayloadEncryptedService
    {
        private const string Prefix = "CIPOL:PES:V1:";
        private const int NonceSize = 12; 
        private const int TagSize = 16;

        private readonly byte[] _key;

        public PayloadCryptoService(string keyString)
        {
            _key = SHA256.HashData(Encoding.UTF8.GetBytes(keyString));
        }

        public bool IsEncrypted(string? value)
            => !string.IsNullOrEmpty(value) && value.StartsWith(Prefix, StringComparison.Ordinal);

        public string? Encrypt(string? plaintext)
        {
            if (plaintext is null) return null;
            if (plaintext.Length == 0) return plaintext;
            if (IsEncrypted(plaintext)) return plaintext;

            byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
            byte[] plainBytes = Encoding.UTF8.GetBytes(plaintext);

            byte[] cipherBytes = new byte[plainBytes.Length];
            byte[] tag = new byte[TagSize];

            using (var aes = new AesGcm(_key))
            {
                aes.Encrypt(nonce, plainBytes, cipherBytes, tag, associatedData: null);
            }

            byte[] cipherWithTag = new byte[cipherBytes.Length + tag.Length];
            Buffer.BlockCopy(cipherBytes, 0, cipherWithTag, 0, cipherBytes.Length);
            Buffer.BlockCopy(tag, 0, cipherWithTag, cipherBytes.Length, tag.Length);

            byte[] payload = new byte[nonce.Length + cipherWithTag.Length];
            Buffer.BlockCopy(nonce, 0, payload, 0, nonce.Length);
            Buffer.BlockCopy(cipherWithTag, 0, payload, nonce.Length, cipherWithTag.Length);

            return Prefix + Convert.ToBase64String(payload);
        }

        public string? Decrypt(string? storedValue)
        {
            if (storedValue is null) return null;
            if (storedValue.Length == 0) return storedValue;

            if (!IsEncrypted(storedValue)) return storedValue;

            byte[] payload = Convert.FromBase64String(storedValue.Substring(Prefix.Length));
            if (payload.Length < NonceSize + TagSize)
                throw new CryptographicException("Payload encriptado inválido (largo insuficiente).");

            byte[] nonce = payload[..NonceSize];
            byte[] cipherWithTag = payload[NonceSize..];

            if (cipherWithTag.Length < TagSize)
                throw new CryptographicException("Payload encriptado inválido (tag insuficiente).");

            int cipherLen = cipherWithTag.Length - TagSize;
            byte[] cipherBytes = cipherWithTag[..cipherLen];
            byte[] tag = cipherWithTag[cipherLen..];

            byte[] plainBytes = new byte[cipherLen];

            using (var aes = new AesGcm(_key))
            {
                aes.Decrypt(nonce, cipherBytes, tag, plainBytes, associatedData: null);
            }

            return Encoding.UTF8.GetString(plainBytes);
        }
    }
}
