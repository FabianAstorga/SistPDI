using System.Security.Claims;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idClaim, out int id))
        {
            return id;
        }
        throw new Exception("El usuario no tiene un ID válido en el token");
    }
}

//var userId = User.GetUserId();