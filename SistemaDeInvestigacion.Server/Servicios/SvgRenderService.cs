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

            // 1. Forzamos un tamaño mínimo y validamos dimensiones
            int width = (int)Math.Ceiling(rect.Width);
            int height = (int)Math.Ceiling(rect.Height);

            // Si Skia detecta un tamaño ínfimo o erróneo (típico en textos con foreignObject)
            if (width < 50 || height < 50 || !float.IsFinite(rect.Width) || !float.IsFinite(rect.Height))
            {
                width = fallbackW;
                height = fallbackH;
                // Reiniciamos el rect para evitar offsets negativos impredecibles
                rect = new SKRect(0, 0, width, height);
            }

            // 2. AÑADIMOS HOLGURA EXTRA AL LIENZO (Margen de seguridad)
            // Esto evita que se corte el "tope" (top) o el "pie" (bottom) por renderizado de fuentes
            int extraMargin = 50;
            int outW = width + (padding * 2) + extraMargin;
            int outH = height + (padding * 2) + extraMargin;

            using var bitmap = new SKBitmap(outW, outH, SKColorType.Rgba8888, SKAlphaType.Premul);
            using var canvas = new SKCanvas(bitmap);
            canvas.Clear(SKColors.Transparent);

            // 3. CAMBIO CLAVE EN LA TRASLACIÓN:
            // Compensamos el origen del CullRect, sumamos el padding y 
            // centramos el extraMargin para dar aire en todos los lados.
            float translateX = padding - rect.Left + (extraMargin / 2f);
            float translateY = padding - rect.Top + (extraMargin / 2f);

            canvas.Translate(translateX, translateY);

            canvas.DrawPicture(picture);
            canvas.Flush();

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);

            return data.ToArray();
        }
    }
}