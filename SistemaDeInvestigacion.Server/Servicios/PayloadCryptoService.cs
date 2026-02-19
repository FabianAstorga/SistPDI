using System.Security.Cryptography;
using System.Text;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public interface IPayloadEncryptedService
    {
        string? Encrypt(string? plaintext);                 // nonce random
        string? EncryptDeterministic(string? plaintext);    // nonce determinístico (para PK/FK)
        string? Decrypt(string? storedValue);
        bool IsEncrypted(string? value);
    }

    public sealed class PayloadCryptoService : IPayloadEncryptedService
    {
        private const string PrefixRnd = "CIPOL:PES:V1:R:";
        private const string PrefixDet = "CIPOL:PES:V1:D:";

        private const int NonceSize = 12;
        private const int TagSize = 16;

        private readonly byte[] _aesKey;
        private readonly byte[] _nonceKey;

        public PayloadCryptoService(string keyString)
        {
            // Clave AES (32 bytes)
            _aesKey = SHA256.HashData(Encoding.UTF8.GetBytes(keyString));

            // Clave separada para derivar nonces determinísticos (evita reusar la AES key)
            _nonceKey = SHA256.HashData(Encoding.UTF8.GetBytes(keyString + "|nonce"));
        }

        public bool IsEncrypted(string? value)
            => !string.IsNullOrEmpty(value) &&
               (value.StartsWith(PrefixRnd, StringComparison.Ordinal) ||
                value.StartsWith(PrefixDet, StringComparison.Ordinal));

        public string? Encrypt(string? plaintext)
        {
            if (plaintext is null) return null;
            if (plaintext.Length == 0) return plaintext;
            if (IsEncrypted(plaintext)) return plaintext;

            byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
            return EncryptCore(PrefixRnd, nonce, plaintext);
        }

        public string? EncryptDeterministic(string? plaintext)
        {
            if (plaintext is null) return null;
            if (plaintext.Length == 0) return plaintext;
            if (IsEncrypted(plaintext)) return plaintext;

            byte[] pt = Encoding.UTF8.GetBytes(plaintext);
            byte[] full = HMACSHA256.HashData(_nonceKey, pt);
            byte[] nonce = full[..NonceSize];

            return EncryptCore(PrefixDet, nonce, plaintext);
        }

        private string EncryptCore(string prefix, byte[] nonce, string plaintext)
        {
            byte[] plainBytes = Encoding.UTF8.GetBytes(plaintext);
            byte[] cipherBytes = new byte[plainBytes.Length];
            byte[] tag = new byte[TagSize];

            using (var aes = new AesGcm(_aesKey, TagSize))
            {
                aes.Encrypt(nonce, plainBytes, cipherBytes, tag, associatedData: null);
            }

            byte[] cipherWithTag = new byte[cipherBytes.Length + tag.Length];
            Buffer.BlockCopy(cipherBytes, 0, cipherWithTag, 0, cipherBytes.Length);
            Buffer.BlockCopy(tag, 0, cipherWithTag, cipherBytes.Length, tag.Length);

            byte[] payload = new byte[nonce.Length + cipherWithTag.Length];
            Buffer.BlockCopy(nonce, 0, payload, 0, nonce.Length);
            Buffer.BlockCopy(cipherWithTag, 0, payload, nonce.Length, cipherWithTag.Length);

            return prefix + Convert.ToBase64String(payload);
        }

        public string? Decrypt(string? storedValue)
        {
            if (storedValue is null) return null;
            if (storedValue.Length == 0) return storedValue;

            if (!IsEncrypted(storedValue)) return storedValue;

            string prefix = storedValue.StartsWith(PrefixRnd, StringComparison.Ordinal) ? PrefixRnd : PrefixDet;

            byte[] payload = Convert.FromBase64String(storedValue.Substring(prefix.Length));
            if (payload.Length < NonceSize + TagSize)
                throw new CryptographicException("Payload encriptado inválido.");

            byte[] nonce = payload[..NonceSize];
            byte[] cipherWithTag = payload[NonceSize..];

            int cipherLen = cipherWithTag.Length - TagSize;
            if (cipherLen < 0) throw new CryptographicException("Payload encriptado inválido.");

            byte[] cipherBytes = cipherWithTag[..cipherLen];
            byte[] tag = cipherWithTag[cipherLen..];

            byte[] plainBytes = new byte[cipherLen];

            using (var aes = new AesGcm(_aesKey, TagSize))
            {
                aes.Decrypt(nonce, cipherBytes, tag, plainBytes, associatedData: null);
            }

            return Encoding.UTF8.GetString(plainBytes);
        }
    }
}
