using Svg;
using System.Drawing; // <--- NECESARIO para Color y Graphics
using System.Drawing.Imaging;
using System.IO;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public class SvgRenderService
    {
        // ---------------------------------------------------------
        // MÉTODO PARA PNG (Mantiene transparencia)
        // ---------------------------------------------------------
        public byte[] RenderToPng(string svgString)
        {
            // 1. Aplicamos los parches de compatibilidad
            svgString = RepararSvg(svgString);

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

        // ---------------------------------------------------------
        // MÉTODO PARA JPG (Nuevo - Con fondo blanco)
        // ---------------------------------------------------------
        public byte[] RenderToJpg(string svgString)
        {
            // 1. Aplicamos los parches de compatibilidad
            svgString = RepararSvg(svgString);

            var svgDocument = SvgDocument.FromSvg<SvgDocument>(svgString);

            // 2. Dibujamos el SVG original (que puede tener fondo transparente)
            using (var svgBitmap = svgDocument.Draw())
            {
                // 3. Creamos un lienzo nuevo para el JPG (sin transparencia)
                using (var jpgBitmap = new Bitmap(svgBitmap.Width, svgBitmap.Height))
                {
                    using (var graphics = Graphics.FromImage(jpgBitmap))
                    {
                        // 4. PINTAMOS EL FONDO DE BLANCO
                        // El JPG no soporta transparencia. Si no haces esto, el fondo sale negro.
                        graphics.Clear(Color.White);

                        // 5. Pegamos el dibujo del SVG encima
                        graphics.DrawImage(svgBitmap, 0, 0);
                    }

                    // 6. Guardamos como JPEG
                    using (var stream = new MemoryStream())
                    {
                        jpgBitmap.Save(stream, ImageFormat.Jpeg);
                        return stream.ToArray();
                    }
                }
            }
        }

        // ---------------------------------------------------------
        // HELPER PRIVADO (Para no repetir código)
        // ---------------------------------------------------------
        private string RepararSvg(string svgString)
        {
            // 1. Asegurar que existe el namespace xlink
            if (!svgString.Contains("xmlns:xlink"))
            {
                svgString = svgString.Replace("<svg ", "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
            }

            // 2. Convertir 'href' moderno a 'xlink:href' antiguo
            if (svgString.Contains(" href=\"data:image"))
            {
                svgString = svgString.Replace(" href=\"data:image", " xlink:href=\"data:image");
            }
            if (svgString.Contains(" href='data:image"))
            {
                svgString = svgString.Replace(" href='data:image", " xlink:href='data:image");
            }

            return svgString;
        }
    }
}