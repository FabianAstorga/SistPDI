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

    public static int GetUserRole(this ClaimsPrincipal user)
    {
        var idClaim = user.FindFirstValue(ClaimTypes.Role);
        if (int.TryParse(idClaim, out int role))
        {
            return role;
        }
        throw new Exception("Usuario no es Admin");
    }
}

//var userId = User.GetUserId();