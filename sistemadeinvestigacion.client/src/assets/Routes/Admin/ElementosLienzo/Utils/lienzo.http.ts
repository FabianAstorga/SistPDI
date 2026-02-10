import { pick, safeJson, toInt } from './lienzo.storage';

export const readResponseBody = async (res: Response) => {
    const text = await res.text();
    try {
        return { kind: 'json' as const, data: JSON.parse(text), raw: text };
    } catch {
        return { kind: 'text' as const, data: text, raw: text };
    }
};
const sanitizeSvgString = (svgString: string): string => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return svgString;
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.removeAttribute('class');
        doc.querySelectorAll('[data-editor="1"]').forEach((n) => n.remove());
        doc.querySelectorAll('[style]').forEach((n) => {
            n.removeAttribute('style');
        });
        doc.querySelectorAll('[data-elid]').forEach((n) => {
            n.removeAttribute('data-elid');
        });
        return new XMLSerializer().serializeToString(svg);
    } catch {
        return svgString;
    }
};

const getSvgStringFromDom = (): string | null => {
    try {
        const svgEl = document.querySelector('svg#lienzo-svg') as SVGSVGElement | null;
        if (!svgEl) return null;
        const clone = svgEl.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        return new XMLSerializer().serializeToString(clone);
    } catch {
        return null;
    }
};

export const guardarAcuerdoFinal = async (params: {
    navigate: (path: string) => void;
    getSvgString?: (() => string | null) | unknown;
    modo: { tipo: number, id?: number };
}) => {
    const { navigate, modo } = params;
    const token = localStorage.getItem('token');

    // 1. Determinar fuente de datos y Endpoint según el Modo
    const storageKey = modo.tipo === 3 ? 'temp_cambio' : 'temp_acuerdo';
    const storageRaw = localStorage.getItem(storageKey);

    // En Modo 2 (Template), permitimos que storageRaw sea nulo si no hay datos previos
    if (!token || (!storageRaw && modo.tipo !== 2)) {
        alert('Error: Faltan datos o la sesión expiró.');
        return;
    }

    const acuerdoBase = safeJson(storageRaw) || {};

    // Configuración dinámica de URL y Método
    let url = `${import.meta.env.VITE_API_URL}/api/Acuerdos/crear`;
    let method = 'POST';

    if (modo.tipo === 2) {
        url = `${import.meta.env.VITE_API_URL}/api/Templates/crear-template`;
    } else if (modo.tipo === 3 && modo.id) {
        url = `${import.meta.env.VITE_API_URL}/api/Acuerdos/editar/${modo.id}`;
        method = 'PUT'; // O el método que use tu API para actualización
    }

    // 2. Obtención y limpieza del SVG
    const maybeFn = params.getSvgString;
    const rawSvgString =
        typeof maybeFn === 'function'
            ? (maybeFn as () => string | null)()
            : getSvgStringFromDom();

    if (!rawSvgString) {
        alert("Error: No se encontró el SVG del lienzo.");
        return;
    }
    const svgEditado = sanitizeSvgString(rawSvgString);

    // 3. Armar objeto final (Payload)
    // Para el Modo 2, si acuerdoBase está vacío, usamos valores por defecto
    const acuerdoFinalObj: any = {
        titulo: String(pick(acuerdoBase, ['Titulo', 'titulo'], modo.tipo === 2 ? 'Nuevo Template' : '') || '').trim(),
        descripcion: String(pick(acuerdoBase, ['Descripcion', 'descripcion'], modo.tipo === 2 ? 'Descripción de plantilla' : '') || '').trim(),
        detallesDescripcion: String(pick(acuerdoBase, ['DetallesDescripcion', 'detallesDescripcion'], '') || '').trim(),
        fechaVencimiento: (() => {
            const raw = pick(acuerdoBase, ['FechaVencimiento', 'fechaVencimiento'], null);
            return raw ? new Date(raw).toISOString() : new Date().toISOString();
        })(),
        estado: String(pick(acuerdoBase, ['Estado', 'estado'], 'ACTIVO') || 'ACTIVO'),
        idEmpresa: toInt(pick(acuerdoBase, ['IdEmpresa', 'idEmpresa'], 0), 0),
        svgEditado: svgEditado,
        svgOriginal: ''
    };

    // Validaciones (Excepto para templates que podrían ser más flexibles)
    if (modo.tipo !== 2 && (!acuerdoFinalObj.titulo || !acuerdoFinalObj.idEmpresa)) {
        alert('Error: El acuerdo debe tener título y empresa seleccionada.');
        return;
    }

    // 4. Preparar FormData
    const fd = new FormData();
    Object.entries(acuerdoFinalObj).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        fd.append(k, String(v));
    });

    console.log(`[HTTP] Enviando a ${url} con método ${method}. Modo: ${modo.tipo}`);

    try {
        const resAcuerdo = await fetch(url, {
            method: method,
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });

        const acuerdoBody = await readResponseBody(resAcuerdo);

        if (resAcuerdo.ok) {
            alert(modo.tipo === 2 ? 'Plantilla guardada.' : 'Acuerdo procesado exitosamente.');

            // Limpieza de estados temporales
            localStorage.removeItem(storageKey);
            localStorage.removeItem('modo');

            navigate('/panel');
            return;
        }

        console.error('Error API:', acuerdoBody);
        alert('Error al guardar. Revisa la consola.');
    } catch (error) {
        console.error('Error inesperado:', error);
        alert('Error de conexión con el servidor.');
    }
};
