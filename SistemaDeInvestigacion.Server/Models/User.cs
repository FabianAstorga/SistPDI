using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaDeInvestigacion.Server.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("name")]
        public required string Name { get; set; }

        [Column("email")]
        public required string Email { get; set; }

        [Column("email_verified_at")]
        public DateTime? EmailVerifiedAt { get; set; }

        [Column("password")]
        public required string Password { get; set; }

        [Column("remember_token")]
        public string? RememberToken { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relación: Un usuario puede tener muchas plantillas
        public virtual ICollection<SvgTemplate> SvgTemplates { get; set; } = new List<SvgTemplate>();
    }
}