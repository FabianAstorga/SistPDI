export const safeJson = (raw: string | null) => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};
export const pick = (obj: any, keys: string[], fallback: any = undefined) => {
    for (const k of keys) {
        const v = obj?.[k];
        if (v !== undefined && v !== null && String(v).length > 0) return v;
    }
    return fallback;
};
export const toBool = (v: any) => v === true || String(v).toLowerCase() === 'true';
export const toInt = (v: any, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : def;
};
export const readUserNameFromLocalStorage = () => {
    const candidates = ['usuario', 'user', 'userName', 'username', 'nombreUsuario', 'nombre', 'author', 'autor'];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const parsed = safeJson(raw);
        if (parsed && typeof parsed === 'object') {
            const name = pick(parsed, ['nombre', 'name', 'userName', 'username', 'mail'], null);
            if (name) return String(name);
        }

        if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim();
    }
    return '—';
};
export const getValueFromTempAcuerdo = (key: string, fallback: string = ''): string => {
    const modoRaw = localStorage.getItem('modo');
    const modo = safeJson(modoRaw);

    const storageKey = modo?.tipo === 3 ? 'temp_cambio' : 'temp_acuerdo';
    const temp = localStorage.getItem(storageKey);

    const parsed = safeJson(temp);
    if (!parsed) return fallback;

    return String(pick(parsed, [key, key.toLowerCase(), key.toUpperCase()], fallback));
};
export const readTempAcuerdo = () => {
    const temp = localStorage.getItem('temp_acuerdo');
    const parsed = safeJson(temp);
    return { raw: temp, parsed };
};
export const updateTempAcuerdo = (cambios: Record<string, any>) => {
    const { parsed } = readTempAcuerdo();
    const nuevo = { ...(parsed || {}), ...cambios };
    localStorage.setItem('temp_acuerdo', JSON.stringify(nuevo));
};