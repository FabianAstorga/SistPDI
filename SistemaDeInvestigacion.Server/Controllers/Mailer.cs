using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

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

    public async Task SendMailAcuerdo(string correoDestino)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("SISAC", _email));
        message.To.Add(MailboxAddress.Parse(correoDestino));




    }

}