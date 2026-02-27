import { pick, safeJson, toInt } from './lienzo.storage';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Configuración de UI personalizada para mantener la estética del sistema
const ui = {
    error: (msj: string) => {
        return MySwal.fire({
            title: 'ERROR',
            text: msj,
            icon: 'error',
            confirmButtonColor: '#002855',
            customClass: { popup: 'rounded-none' }
        });
    },
    exito: (msj: string) => {
        return MySwal.fire({
            title: 'ÉXITO',
            text: msj,
            icon: 'success',
            confirmButtonColor: '#002855',
            customClass: { popup: 'rounded-none' }
        });
    }
};

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
        return resultadoFinal;
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

    const storageKey = modo.tipo === 3 ? 'temp_cambio' : 'temp_acuerdo';
    const storageRaw = localStorage.getItem(storageKey);

    if (!token) {
        await ui.error('La sesión expiró.');
        return;
    }

    const maybeFn = params.getSvgString;
    const rawSvgString =
        typeof maybeFn === 'function'
            ? (maybeFn as () => string | null)()
            : getSvgStringFromDom();

    if (!rawSvgString) {
        await ui.error("No se encontró el SVG del lienzo.");
        return;
    }
    const svgFinal = sanitizeSvgString(rawSvgString);

    let url = `${import.meta.env.VITE_API_URL}/api/Acuerdos/crear`;
    let method = 'POST';
    let body: any = null;
    let headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
    };

    // --- LÓGICA MODO 4: EDICIÓN DE PLANTILLA (PATCH) ---
    if (modo.tipo === 4) {
        if (!modo.id) {
            await ui.error("ID de plantilla no encontrado.");
            return;
        }
        url = `${import.meta.env.VITE_API_URL}/api/Svg/editar?idSvg=${modo.id}&svgOriginal=${encodeURIComponent(svgFinal)}`;
        method = 'PATCH';
        headers['Content-Type'] = 'application/json';
        body = null;
    }
    // --- LÓGICA MODO 2: CREAR TEMPLATE ---
    else if (modo.tipo === 2) {
        url = `${import.meta.env.VITE_API_URL}/api/Svg/crearTemplate`;
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
            svg_original: svgFinal,
            estado: true
        });
    }
    // --- LÓGICA MODOS 1 Y 3: ACUERDOS ---
    else {
        const fd = new FormData();
        const acuerdoBase = safeJson(storageRaw) || {};

        if (modo.tipo === 3 && modo.id) {
            url = `${import.meta.env.VITE_API_URL}/api/Acuerdos/editar/${modo.id}`;
            method = 'PATCH';

            if (acuerdoBase.titulo) fd.append('titulo', acuerdoBase.titulo);
            if (acuerdoBase.descripcion) fd.append('descripcion', acuerdoBase.descripcion);
            if (acuerdoBase.detallesDescripcion) fd.append('detallesDescripcion', acuerdoBase.detallesDescripcion);
            if (acuerdoBase.idEmpresa) fd.append('idEmpresa', String(acuerdoBase.idEmpresa));
            if (acuerdoBase.idCategoria) fd.append('idCategoria', String(acuerdoBase.idCategoria));

            if (acuerdoBase.fechaVencimiento) {
                fd.append('fechaVencimiento', new Date(acuerdoBase.fechaVencimiento).toISOString());
            }

            fd.append('svg_editado', svgFinal);

        } else {
            fd.append('titulo', String(pick(acuerdoBase, ['Titulo', 'titulo'], '') || '').trim());
            fd.append('descripcion', String(pick(acuerdoBase, ['Descripcion', 'descripcion'], '') || '').trim());
            fd.append('detallesDescripcion', String(pick(acuerdoBase, ['DetallesDescripcion', 'detallesDescripcion'], '') || '').trim());

            const fVenc = pick(acuerdoBase, ['FechaVencimiento', 'fechaVencimiento'], null);
            fd.append('fechaVencimiento', fVenc ? new Date(fVenc).toISOString() : new Date().toISOString());

            fd.append('idEmpresa', String(toInt(pick(acuerdoBase, ['IdEmpresa', 'idEmpresa'], 0), 0)));
            fd.append('idCategoria', String(toInt(pick(acuerdoBase, ['IdCategoria', 'idCategoria'], 0), 0)));
            fd.append('estado', 'ACTIVO');
            fd.append('svgEditado', svgFinal);
            fd.append('svgOriginal', localStorage.getItem('template_svg') || '');

            if (!fd.get('titulo') || fd.get('idEmpresa') === '0') {
                await ui.error('El acuerdo debe tener título y empresa seleccionada.');
                return;
            }
        }

        const idsUnidades = pick(acuerdoBase, ['idsUnidades', 'IdsUnidades'], []);
        if (Array.isArray(idsUnidades)) {
            idsUnidades.forEach((id: number) => fd.append('idsUnidades', String(id)));
        }

        body = fd;
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
            let mensajeExito = 'Acuerdo procesado exitosamente.';
            if (modo.tipo === 4) mensajeExito = 'Plantilla base editada con éxito.';
            else if (modo.tipo === 2) mensajeExito = 'Plantilla guardada.';

            await ui.exito(mensajeExito);

            localStorage.removeItem('temp_cambio');
            localStorage.removeItem('temp_acuerdo');
            localStorage.removeItem('modo');
            localStorage.removeItem('template_svg');
            localStorage.removeItem('template_svg_edit');

            navigate(modo.tipo === 4 ? '/EditarSvg' : '/panel');
            return;
        }

        console.error('Error API:', acuerdoBody);
        await ui.error(`Error al guardar: ${acuerdoBody.data?.message || 'Revisa la consola.'}`);
    } catch (error) {
        console.error('Error inesperado:', error);
        await ui.error('Error de conexión con el servidor.');
    }
};