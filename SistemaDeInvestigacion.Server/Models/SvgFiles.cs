using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace SistemaDeInvestigacion.Server.Models
{
    [Table("svg_files")]
    public class SvgFiles
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("filename")]
        public required string Filename { get; set; }

        [Column("original_svg")]
        public string? OriginalSvg { get; set; }

        [Column("processed_svg")]
        public string? ProcessedSvg { get; set; }

        [Column("elements")]
        public string? Elements { get; set; }

        [Column("institution")]
        public string? Institution { get; set; }

        [Column("type")]
        public string? Type { get; set; }

        [Column("status")]
        public string Status { get; set; } = "draft";

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("titulo")]
        public string? Titulo { get; set; }

        [Column("texto")]
        public string? Texto { get; set; }

        [Column("telefono")]
        public string? Telefono { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
