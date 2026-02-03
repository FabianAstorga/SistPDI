using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Utils;
using static System.Net.Mime.MediaTypeNames;

public class AuthMailService
{
    private readonly string _email = "informaciones.pmacap@investigaciones.cl";
    private readonly string _pass = "Pm.informaciones";
    private readonly string _host = "smtp.investigaciones.cl";

    public async Task SendCode(string correoDestino, string codigo)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Soporte SISAC", _email));
        message.To.Add(MailboxAddress.Parse(correoDestino));
        message.Subject = "Código de Recuperación de Contraseña";
        message.Body = new TextPart("html")
        {
            Text = $@"
                <h1>Recuperación de Contraseña</h1>
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Tu código de seguridad es: <b>{codigo}</b></p>
                <p>Si no solicitaste esto, ignora este correo.</p>"
        };


        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_host, 25, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_email, _pass);
            await client.SendAsync(message);
        }
        catch (Exception ex)
        {
            throw new Exception("Error al enviar el correo de recuperación.");
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }

    public async Task SendMailAcuerdo(string correoDestino, string titulo, string descripcion, string rutaArchivo)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Notificaciones SISAC", _email));
        message.To.Add(MailboxAddress.Parse(correoDestino));
        message.Subject = $"Nuevo Acuerdo Publicado: {titulo}";

        var builder = new BodyBuilder();

        // Verificamos que el archivo exista antes de intentar adjuntarlo para evitar excepciones
        if (File.Exists(rutaArchivo))
        {
            var imagen = builder.LinkedResources.Add(rutaArchivo);
            imagen.ContentId = MimeUtils.GenerateMessageId();

            builder.HtmlBody = $@"
            <div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;'>
                <h2 style='color: #2c3e50;'>Te notificamos que se ha creado un nuevo acuerdo</h2>
                <hr />
                <p><strong>{titulo}</strong></p>
                <p>{descripcion}</p>
                <p>Para más detalle, revisa la plataforma SISAC.</p>
                <div style='text-align: center; margin-top: 20px;'>
                    <img src='cid:{imagen.ContentId}' alt='Imagen' style='max-width: 100%; border-radius: 8px;' />
                </div>
                <hr />
                <p style='font-size: 0.8em; color: #7f8c8d;'>Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>";
        }
        else
        {
            builder.HtmlBody = $"<h2>Nuevo Acuerdo: {titulo}</h2><p>{descripcion}</p>";
        }

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_host, 25, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_email, _pass);
            await client.SendAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al enviar correo a {correoDestino}: {ex.Message}");
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}