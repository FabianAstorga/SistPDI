import { pick, safeJson, toInt } from './lienzo.storage';

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

        // Serializa el svg limpio (solo <svg>...</svg>)
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

        // Serializamos "raw", y sanitizamos después sí o sí
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

    // 2) ✅ SIEMPRE limpiar el SVG aquí
    const svgEditado = sanitizeSvgString(rawSvgString);

    // 3) ✅ Armar acuerdo según Swagger (y enviar TODO a /api/Acuerdos/crear)
    const acuerdoFinalObj: any = {
        // Swagger:
        // titulo*, descripcion*, detallesDescripcion*, fechaVencimiento*, estado*, idEmpresa*, svgEditado*, svgOriginal (opcional)

        titulo: String(pick(acuerdoBase, ['Titulo', 'titulo'], '') || '').trim(),
        descripcion: String(pick(acuerdoBase, ['Descripcion', 'descripcion'], '') || '').trim(),
        detallesDescripcion: String(pick(acuerdoBase, ['DetallesDescripcion', 'detallesDescripcion'], '') || '').trim(),
        fechaVencimiento: (() => {
            const raw = pick(acuerdoBase, ['FechaVencimiento', 'fechaVencimiento'], null);
            return raw ? new Date(raw).toISOString() : new Date().toISOString();
        })(),
        estado: String(pick(acuerdoBase, ['Estado', 'estado'], 'ACTIVO') || 'ACTIVO'),

        // ✅ idEmpresa (tu temp_acuerdo trae idEmpresa)
        idEmpresa: toInt(pick(acuerdoBase, ['IdEmpresa', 'idEmpresa'], 0), 0),

        // ✅ requerido: el <svg ...> completo
        svgEditado: svgEditado,

        // ✅ opcional: “Send empty value” => mandamos vacío
        svgOriginal: ''
    };

    // Validaciones rápidas (para evitar pegarle al backend en vano)
    if (!acuerdoFinalObj.titulo) {
        console.warn('[guardarAcuerdoFinal] falta titulo:', acuerdoFinalObj);
        alert('Error: Falta título.');
        return;
    }
    if (!acuerdoFinalObj.descripcion) {
        console.warn('[guardarAcuerdoFinal] falta descripcion:', acuerdoFinalObj);
        alert('Error: Falta descripción.');
        return;
    }
    if (!acuerdoFinalObj.detallesDescripcion) {
        console.warn('[guardarAcuerdoFinal] falta detallesDescripcion:', acuerdoFinalObj);
        alert('Error: Falta detallesDescripción.');
        return;
    }
    if (!acuerdoFinalObj.idEmpresa) {
        console.warn('[guardarAcuerdoFinal] acuerdoBase:', acuerdoBase);
        alert('Error: No hay empresa seleccionada (idEmpresa). Vuelve al formulario y selecciona una.');
        return;
    }
    if (!acuerdoFinalObj.svgEditado || String(acuerdoFinalObj.svgEditado).trim().length === 0) {
        alert('Error: svgEditado viene vacío.');
        return;
    }

    // ✅ LOGS ANTES DE ENVIAR (payload)
    console.groupCollapsed('[guardarAcuerdoFinal] ✅ Payload a enviar (/api/Acuerdos/crear)');
    console.log('acuerdoFinalObj:', acuerdoFinalObj);
    console.log('svgEditado length:', svgEditado.length);
    console.log('svgEditado preview:', svgEditado.slice(0, 300) + ` ... (len=${svgEditado.length})`);
    console.groupEnd();

    // 4) FormData (multipart/form-data)
    const fd = new FormData();
    Object.entries(acuerdoFinalObj).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        fd.append(k, String(v));
    });

    // ✅ LOG FormData real (clave)
    console.groupCollapsed('[guardarAcuerdoFinal] ✅ FormData a enviar (/api/Acuerdos/crear)');
    for (const [k, v] of fd.entries()) {
        if (k === 'svgEditado') {
            const s = String(v);
            console.log(k, s.slice(0, 300) + ` ... (len=${s.length})`);
        } else {
            console.log(k, v);
        }
    }
    console.groupEnd();

    try {
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
            return;
        }

        // ✅ LOG completo del 400 / ModelState
        console.group('[guardarAcuerdoFinal] ❌ Error en /api/Acuerdos/crear');
        console.error('Status:', resAcuerdo.status, resAcuerdo.statusText);
        console.log('Body.kind:', acuerdoBody.kind);
        console.log('Body.data:', acuerdoBody.data);
        console.log('Body.raw:', acuerdoBody.raw);
        console.groupEnd();

        alert('No se pudo publicar el acuerdo. Revisa la consola para ver el detalle.');
    } catch (error) {
        console.group('[guardarAcuerdoFinal] ❌ Error inesperado');
        console.error(error);
        console.groupEnd();
        alert('Error inesperado. Revisa consola.');
    }
};
