import { pick, safeJson, toBool, toInt } from './lienzo.storage';

export const readResponseBody = async (res: Response) => {
    const text = await res.text();
    try {
        return { kind: 'json' as const, data: JSON.parse(text), raw: text };
    } catch {
        return { kind: 'text' as const, data: text, raw: text };
    }
};

export const guardarAcuerdoFinal = async (params: {
    navigate: (path: string) => void;
    getSvgString: () => string | null;
}) => {
    const { navigate, getSvgString } = params;

    const token = localStorage.getItem('token');
    const storageRaw = localStorage.getItem('temp_acuerdo');

    if (!token || !storageRaw) {
        alert('Error: Faltan datos del acuerdo o la sesión expiró.');
        return;
    }

    const acuerdoBase = safeJson(storageRaw);
    if (!acuerdoBase) {
        alert('Error: temp_acuerdo no es JSON válido.');
        return;
    }

    const svgString = getSvgString();
    if (!svgString) {
        alert('Error: No se encontró el SVG del lienzo.');
        return;
    }

    try {
        const svgPayload = { svg_original: svgString, svg_editado: svgString, estado: true };

        const resSvg = await fetch('http://localhost:5091/api/Svg/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(svgPayload)
        });

        const svgBody = await readResponseBody(resSvg);
        if (!resSvg.ok) throw new Error('Error al guardar el diseño.');

        const svgData = (svgBody.kind === 'json' ? svgBody.data : null) as any;
        const idGeneradoSvg = toInt(pick(svgData, ['id', 'Id', 'idSvgTemplate', 'IdSvgTemplate'], 0), 0);

        const acuerdoFinalObj: any = {
            idAcuerdo: 0,
            titulo: String(pick(acuerdoBase, ['Titulo', 'titulo'], '') || '').trim(),
            descripcion: String(pick(acuerdoBase, ['Descripcion', 'descripcion'], '') || '').trim(),
            detallesDescripcion: String(pick(acuerdoBase, ['DetallesDescripcion', 'detallesDescripcion'], '') || '').trim(),
            fechaVencimiento: (() => {
                const raw = pick(acuerdoBase, ['FechaVencimiento', 'fechaVencimiento'], null);
                return raw ? new Date(raw).toISOString() : new Date().toISOString();
            })(),
            estado: String(pick(acuerdoBase, ['Estado', 'estado'], 'Activo') || 'Activo'),
            pdfUrl: String(pick(acuerdoBase, ['PdfUrl', 'pdfUrl'], '') || '').trim(),
            imagenUrl: String(pick(acuerdoBase, ['ImagenUrl', 'imagenUrl'], '') || '').trim(),
            habilitado: toBool(pick(acuerdoBase, ['Habilitado', 'habilitado'], true)),
            idInstitucion: toInt(pick(acuerdoBase, ['IdInstitucion', 'idInstitucion'], 1), 1),
            idSvgTemplate: toInt(idGeneradoSvg, 0)
        };

        const fd = new FormData();
        Object.entries(acuerdoFinalObj).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            fd.append(k, typeof v === 'boolean' ? String(v) : String(v));
        });

        const resAcuerdo = await fetch('http://localhost:5091/api/Acuerdos/crear', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });

        const acuerdoBody = await readResponseBody(resAcuerdo);

        if (resAcuerdo.ok) {
            alert('Acuerdo publicado exitosamente.');
            localStorage.removeItem('temp_acuerdo');
            navigate('/panel');
        } else {
            console.error('Fallo validacion:', acuerdoBody.data);
            alert('No se pudo publicar el acuerdo. Revisa la consola para ver el detalle.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error inesperado. Revisa consola.');
    }
};
