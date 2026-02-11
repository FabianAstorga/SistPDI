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
        console.log("[HTTP] 🧹 Iniciando sanitización del SVG...");
        const nodosEditor = doc.querySelectorAll('[data-editor="1"]');
        console.log(`[HTTP] 🗑️ Eliminando ${nodosEditor.length} elementos de interfaz (manejadores/nodos)`);   
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
        const resultadoFinal = new XMLSerializer().serializeToString(svg);
        console.log("[HTTP] ✅ SVG Sanitizado listo para enviar/descargar. Tamaño caracteres:", resultadoFinal.length);
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

    // Determinamos la fuente de datos
    const storageKey = modo.tipo === 3 ? 'temp_cambio' : 'temp_acuerdo';
    const storageRaw = localStorage.getItem(storageKey);

    if (!token || (!storageRaw && modo.tipo !== 2)) {
        alert('Error: Faltan datos o la sesión expiró.');
        return;
    }

    // 1. Obtención y limpieza del SVG
    const maybeFn = params.getSvgString;
    const rawSvgString =
        typeof maybeFn === 'function'
            ? (maybeFn as () => string | null)()
            : getSvgStringFromDom();

    if (!rawSvgString) {
        alert("Error: No se encontró el SVG del lienzo.");
        return;
    }
    const svgFinal = sanitizeSvgString(rawSvgString);

    // 2. Configuración dinámica según Modo
    let url = `${import.meta.env.VITE_API_URL}/api/Acuerdos/crear`;
    let method = 'POST';
    let body: any = null;
    let headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
    };

    if (modo.tipo === 2) {
        // --- LÓGICA MODO 2: TEMPLATE (JSON) ---
        url = `${import.meta.env.VITE_API_URL}/api/Svg/crearTemplate`;
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
            svg_original: svgFinal,
            estado: true
        });
    } else {
        // --- LÓGICA MODOS 1 Y 3: ACUERDOS (FormData) ---
        if (modo.tipo === 3 && modo.id) {
            url = `${import.meta.env.VITE_API_URL}/api/Acuerdos/editar/${modo.id}`;
            method = 'PUT';
        }

        const acuerdoBase = safeJson(storageRaw) || {};
        const acuerdoFinalObj: any = {
            titulo: String(pick(acuerdoBase, ['Titulo', 'titulo'], '') || '').trim(),
            descripcion: String(pick(acuerdoBase, ['Descripcion', 'descripcion'], '') || '').trim(),
            detallesDescripcion: String(pick(acuerdoBase, ['DetallesDescripcion', 'detallesDescripcion'], '') || '').trim(),
            fechaVencimiento: (() => {
                const raw = pick(acuerdoBase, ['FechaVencimiento', 'fechaVencimiento'], null);
                return raw ? new Date(raw).toISOString() : new Date().toISOString();
            })(),
            estado: String(pick(acuerdoBase, ['Estado', 'estado'], 'ACTIVO') || 'ACTIVO'),
            idEmpresa: toInt(pick(acuerdoBase, ['IdEmpresa', 'idEmpresa'], 0), 0),
            svgEditado: svgFinal,
            svgOriginal: ''
        };

        if (!acuerdoFinalObj.titulo || !acuerdoFinalObj.idEmpresa) {
            alert('Error: El acuerdo debe tener título y empresa seleccionada.');
            return;
        }

        const fd = new FormData();
        Object.entries(acuerdoFinalObj).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            fd.append(k, String(v));
        });
        body = fd;
        // El navegador gestiona el Content-Type para FormData automáticamente
    }

    console.log(`[HTTP] Enviando a ${url} con método ${method}. Modo: ${modo.tipo}`);

    try {
        const resAcuerdo = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });

        const acuerdoBody = await readResponseBody(resAcuerdo);

        if (resAcuerdo.ok) {
            alert(modo.tipo === 2 ? 'Plantilla guardada.' : 'Acuerdo procesado exitosamente.');

            // Limpieza de estados temporales
            localStorage.removeItem(storageKey);
            localStorage.removeItem('modo');
            localStorage.removeItem('template_svg');

            navigate('/panel');
            return;
        }

        console.error('Error API:', acuerdoBody);
        alert(`Error al guardar: ${acuerdoBody.data?.message || 'Revisa la consola.'}`);
    } catch (error) {
        console.error('Error inesperado:', error);
        alert('Error de conexión con el servidor.');
    }
};