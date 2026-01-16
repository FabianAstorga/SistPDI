import { pick, safeJson, toBool, toInt } from './lienzo.storage';

export const readResponseBody = async (res: Response) => {
    const text = await res.text();
    try {
        return { kind: 'json' as const, data: JSON.parse(text), raw: text };
    } catch {
        return { kind: 'text' as const, data: text, raw: text };
    }
};

const getSvgStringFromDom = (): string | null => {
    try {
        const byId = document.querySelector('svg#lienzo-svg') as SVGElement | null;
        const svgEl = byId ?? (document.querySelector('svg') as SVGElement | null);
        if (!svgEl) return null;

        return new XMLSerializer().serializeToString(svgEl);
    } catch {
        return null;
    }
};

export const guardarAcuerdoFinal = async (params: {
    navigate: (path: string) => void;
    getSvgString?: (() => string | null) | unknown;
}) => {
    const { navigate } = params;

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

    const maybeFn = params.getSvgString;
    const svgString =
        typeof maybeFn === 'function'
            ? (maybeFn as () => string | null)()
            : getSvgStringFromDom();

    if (!svgString) {
        alert("Error: No se encontró el SVG del lienzo. (Idealmente pon id='lienzo-svg' al <svg>).");
        return;
    }

    try {
        // 1) Crear SVG
        const svgPayload = { svg_original: svgString, svg_editado: svgString, estado: true };

        const resSvg = await fetch('http://localhost:5091/api/Svg/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(svgPayload)
        });

        const svgBody = await readResponseBody(resSvg);

        if (!resSvg.ok) {
            console.error('Respuesta SVG:', svgBody.data);
            alert('No se pudo guardar el diseño SVG. Revisa consola.');
            return;
        }

        // ✅ AHORA tu backend devuelve { id: ... } (o un objeto con id)
        const svgData = (svgBody.kind === 'json' ? svgBody.data : null) as any;
        const idGeneradoSvg = toInt(pick(svgData, ['id', 'Id'], 0), 0);

        if (!idGeneradoSvg) {
            console.error('SVG create response (sin id):', svgData);
            alert('Error: el backend no devolvió el id del SVG. Revisa el return del SvgController.');
            return;
        }

        // 2) Armar acuerdo con FK correcta
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
            idInstitucion: toInt(pick(acuerdoBase, ['IdInstitucion', 'idInstitucion'], 0), 0),

            // ✅ ESTE ES EL CAMBIO CLAVE: el acuerdo debe apuntar al svg creado
            idSvgTemplate: idGeneradoSvg
        };

        if (!acuerdoFinalObj.idInstitucion) {
            console.warn('acuerdoBase:', acuerdoBase);
            alert('Error: No hay institución seleccionada. Vuelve al formulario y selecciona una.');
            return;
        }

        // 3) Enviar acuerdo
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
