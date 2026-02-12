using Svg;
using System.Drawing.Imaging;
using System.IO;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public class SvgRenderService
    {
        public byte[] RenderToPng(string svgString)
        {
            // =================================================================
            // PARCHE DE COMPATIBILIDAD PARA IMÁGENES BASE64
            // =================================================================

            // 1. Asegurar que existe el namespace xlink en la cabecera del SVG
            if (!svgString.Contains("xmlns:xlink"))
            {
                // Si no tiene la definición, la inyectamos en la etiqueta <svg>
                svgString = svgString.Replace("<svg ", "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
            }

            // 2. Convertir 'href' moderno a 'xlink:href' antiguo (necesario para esta librería)
            // Buscamos específicamente href con data:image para no romper enlaces web si hubiera
            if (svgString.Contains(" href=\"data:image"))
            {
                svgString = svgString.Replace(" href=\"data:image", " xlink:href=\"data:image");
            }
            if (svgString.Contains(" href='data:image"))
            {
                svgString = svgString.Replace(" href='data:image", " xlink:href='data:image");
            }

            // =================================================================

            var svgDocument = SvgDocument.FromSvg<SvgDocument>(svgString);

            using (var bitmap = svgDocument.Draw())
            {
                using (var stream = new MemoryStream())
                {
                    bitmap.Save(stream, ImageFormat.Png);
                    return stream.ToArray();
                }
            }
        }
    }
}