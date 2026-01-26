import { pick, safeJson, toBool, toInt } from './lienzo.storage';

export const readResponseBody = async (res: Response) => {
    const text = await res.text();
    try {
        return { kind: 'json' as const, data: JSON.parse(text), raw: text };
    } catch {
        return { kind: 'text' as const, data: text, raw: text };
    }
};

// ✅ Limpia el SVG para export (sin UI del editor)
const sanitizeSvgString = (svgString: string): string => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');

        const svg = doc.querySelector('svg');
        if (!svg) return svgString;

        // Asegura standalone
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // Quita clases del editor
        svg.removeAttribute('class');

        // Quita TODO lo editor-only
        doc.querySelectorAll('[data-editor="1"]').forEach((n) => n.remove());

        // Quita cursores y estilos del editor
        doc.querySelectorAll('[style]').forEach((n) => {
            n.removeAttribute('style');
        });

        // Si quieres, quita data-elid también
        doc.querySelectorAll('[data-elid]').forEach((n) => {
            n.removeAttribute('data-elid');
        });

        // Serializa el svg limpio
        return new XMLSerializer().serializeToString(svg);
    } catch {
        // si algo falla, devuelve el original
        return svgString;
    }
};

const getSvgStringFromDom = (): string | null => {
    try {
        const svgEl = document.querySelector('svg#lienzo-svg') as SVGSVGElement | null;
        if (!svgEl) return null;

        const clone = svgEl.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // IMPORTANTE: aquí serializamos "raw", y sanitizamos después sí o sí
        return new XMLSerializer().serializeToString(clone);
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

    // 1) Obtén SVG (de getSvgString o del DOM)
    const maybeFn = params.getSvgString;
    const rawSvgString =
        typeof maybeFn === 'function'
            ? (maybeFn as () => string | null)()
            : getSvgStringFromDom();

    if (!rawSvgString) {
        alert("Error: No se encontró el SVG del lienzo (id='lienzo-svg').");
        return;
    }

    // 2) ✅ SIEMPRE limpiar el SVG aquí (a prueba de balas)
    const svgString = sanitizeSvgString(rawSvgString);

    // 🔎 DEBUG opcional: descomenta para confirmar que NO sale cursor/data-editor
    // console.log('SVG limpio:', svgString);

    try {
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

        const svgData = (svgBody.kind === 'json' ? svgBody.data : null) as any;
        const idGeneradoSvg = toInt(pick(svgData, ['id', 'Id'], 0), 0);

        if (!idGeneradoSvg) {
            console.error('SVG create response (sin id):', svgData);
            alert('Error: el backend no devolvió el id del SVG. Revisa el return del SvgController.');
            return;
        }

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

            idSvgTemplate: idGeneradoSvg
        };

        if (!acuerdoFinalObj.idInstitucion) {
            console.warn('acuerdoBase:', acuerdoBase);
            alert('Error: No hay institución seleccionada. Vuelve al formulario y selecciona una.');
            return;
        }

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
