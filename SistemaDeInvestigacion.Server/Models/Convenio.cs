using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace SistemaDeInvestigacion.Server.Models
{
    [Table("convenios")]
    public class Convenio
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("title")]
        public required string Title { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("full_description")]
        public string? FullDescription { get; set; }

        [Column("type")]
        public string? Type { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("institution")]
        public string? Institution { get; set; }

        [Column("date")]
        public DateOnly? Date { get; set; }

        [Column("validity")]
        public string? Validity { get; set; }

        [Column("status")]
        public string? Status { get; set; }

        [Column("parties")]
        public string? Parties { get; set; }

        [Column("pdf_url")]
        public string? PdfUrl { get; set; }

        [Column("imagen_url")]
        public string? ImagenUrl { get; set; }

        [Column("url_externo")]
        public string? UrlExterno { get; set; }

        [Column("flag")]
        public int Flag { get; set; } = 0;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relaciones
        public virtual ICollection<Documento> Documentos { get; set; } = new List<Documento>();
        public virtual ICollection<Contacto> Contactos { get; set; } = new List<Contacto>();
        public virtual ICollection<Objetivo> Objetivos { get; set; } = new List<Objetivo>();
    }
}
