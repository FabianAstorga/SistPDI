using SkiaSharp;
using Svg.Skia;

namespace SistemaDeInvestigacion.Server.Servicios
{
    public class SvgRenderService
    {
        public byte[] RenderToPng(string svgText, int padding = 30, int fallbackW = 1200, int fallbackH = 800)
        {
            if (string.IsNullOrWhiteSpace(svgText))
                throw new ArgumentException("SVG vacío.");

            svgText = svgText.Trim();

            using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(svgText));
            var skSvg = new SKSvg();
            var picture = skSvg.Load(stream);

            if (picture == null)
                throw new InvalidOperationException("No se pudo parsear el SVG.");

            var rect = picture.CullRect;

            int width = (int)Math.Ceiling(rect.Width);
            int height = (int)Math.Ceiling(rect.Height);

            // Fallback si el CullRect viene raro
            if (width < 2 || height < 2 || !float.IsFinite(rect.Width) || !float.IsFinite(rect.Height))
            {
                width = fallbackW;
                height = fallbackH;
                rect = new SKRect(0, 0, width, height);
            }

            int outW = width + padding * 2;
            int outH = height + padding * 2;

            using var bitmap = new SKBitmap(outW, outH, SKColorType.Rgba8888, SKAlphaType.Premul);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.Transparent);

            // ✅ CLAVE: compensar origen del CullRect y sumar padding
            canvas.Translate(padding - rect.Left, padding - rect.Top);

            canvas.DrawPicture(picture);
            canvas.Flush();

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);

            return data.ToArray();
        }
    }
}
