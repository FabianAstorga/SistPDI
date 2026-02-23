public class acuerdosAuditoria
{
    public int idaccion { get; set; }
    public int idpersona { get; set; }
    public string accion { get; set; }
    public DateTime fechacambio { get; set; }
    public int idacuerdo { get; set; }
    public string valorantiguo { get; set; }
    public string valornuevo { get; set; }
}

public class categoriaAuditoria
{
    public int idaccion { get; set; }
    public int idpersona { get; set; }
    public string accion { get; set; }
    public DateTime fechacambio { get; set; }
    public int idcategoria { get; set; }
}

public class empresasAuditoria
{
    public int idaccion { get; set; }
    public int idpersona { get; set; }
    public string accion { get; set; }
    public DateTime fechacambio { get; set; }
    public int idempresa { get; set; }
}


public class svgAuditoria
{
    public int idaccion { get; set; }
    public int idpersona { get; set; }
    public string accion { get; set; }
    public DateTime fechacambio { get; set; }
    public int idsvg { get; set; }
    public string valorantiguo { get; set; }
    public string valornuevo { get; set; }
}

public class usersAuditoria
{
    public int idaccion { get; set; }
    public int idpersona { get; set; }
    public string accion { get; set; }
    public DateTime fechacambio { get; set; }
    public int idafectado { get; set; }
}
