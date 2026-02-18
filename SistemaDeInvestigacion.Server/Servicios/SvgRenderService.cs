using Svg;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public class SvgRenderService
    {

        public byte[] RenderToPng(string svgString)
        {
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

        public byte[] RenderToJpg(string svgString)
        {
            svgString = RepararSvg(svgString);

            var svgDocument = SvgDocument.FromSvg<SvgDocument>(svgString);
            using (var svgBitmap = svgDocument.Draw())
            {
                using (var jpgBitmap = new Bitmap(svgBitmap.Width, svgBitmap.Height))
                {
                    using (var graphics = Graphics.FromImage(jpgBitmap))
                    {
                        graphics.Clear(Color.White);
                        graphics.DrawImage(svgBitmap, 0, 0);
                    }
                    using (var stream = new MemoryStream())
                    {
                        jpgBitmap.Save(stream, ImageFormat.Jpeg);
                        return stream.ToArray();
                    }
                }
            }
        }

        private string RepararSvg(string svgString)
        {
            if (!svgString.Contains("xmlns:xlink"))
            {
                svgString = svgString.Replace("<svg ", "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
            }
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