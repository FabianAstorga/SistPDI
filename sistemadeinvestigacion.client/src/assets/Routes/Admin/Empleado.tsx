//Ruta para la creacion de funcionarios, aqui se maneja la logica de que tanto funcionarios como administradores pueden acceder
//y estos dos roles pueden crear FUNCIONARIOS en el sistema, mas no asignarles usuario, esto porque a nivel de base de datos tenemos
//los funcionarios (reflejo real de los datos de cada persona, por ende estan cifrados) y los usuarios de sistema (tomamos el rut
// de los funcionarios y le creamos una cuenta con correo y contraseña) Esto se hace asi para resguardar los datos privados, ya que el
//sistema existe desde los usuarios para adelante, no desde los funcionarios
//Solo los administradores pueden asignarle a los funcionarios creados en sistema un usuario y contraseña para que accedan.
//Tambien se implemento un metodo de carga massiva con un excel para hacer esta tarea mas facil (carga massiva de funcinoarios no de usuarios)
import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Virtuoso } from 'react-virtuoso';
import * as XLSX from 'xlsx'; 
import { Navbar } from '../../components/Navbar';
import {
    ShieldCheck,
    RefreshCw,
    ShieldAlert,
    User,
    UserCheck,
    Mail,
    Hash,
    X,
    Save,
    Fingerprint,
    Info,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    LockIcon,
    Plus,
    Boxes,
    Building2,
    FileSpreadsheet,
    Download
} from 'lucide-react';

const FAST_TRANSITION = { type: "spring", stiffness: 400, damping: 30 };
const API_BASE = import.meta.env.VITE_API_URL;
const HERO_BG = "/i_region_cuartel_investigaciones_arica.png";
const LABEL_STYLE = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 flex items-center gap-2";
const INPUT_STYLE = "w-full bg-slate-100 border-b border-slate-200 text-slate-900 px-4 py-3 outline-none focus:border-[#002855] focus:bg-white transition-all duration-300 font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed";

const safeJson = async (res: Response) => {
    if (!res.ok) return null;
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch (e) { return null; }
};

export default function AdministracionIdentidad() {
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedFunc, setSelectedFunc] = useState<any | null>(null);

    const [excelPreview, setExcelPreview] = useState<any[]>([]);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);

    const currentUserId = useMemo(() => {
        const userJson = localStorage.getItem('user');
        if (!userJson) return null;
        try {
            const userObj = JSON.parse(userJson);
            return userObj.idUsuario || userObj.idPersona;
        } catch (e) { return null; }
    }, []);

    const currentUserRole = useMemo(() => {
        const token = localStorage.getItem('token');
        if (!token) return 2;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return parseInt(payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["role"] || "2");
        } catch (e) { return 2; }
    }, []);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

            const [resFunc, resUsr, resUni] = await Promise.all([
                fetch(`${API_BASE}/api/Funcionarios`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Users`, { headers, signal: abortControllerRef.current.signal }),
                fetch(`${API_BASE}/api/Unidad`, { headers, signal: abortControllerRef.current.signal })
            ]);

            const dataFunc = await safeJson(resFunc);
            const dataUsr = await safeJson(resUsr);
            const dataUni = await safeJson(resUni);

            setFuncionarios(Array.isArray(dataFunc) ? dataFunc : []);
            setUsuarios(Array.isArray(dataUsr) ? dataUsr : []);
            setUnidades(Array.isArray(dataUni) ? dataUni : (dataUni?.$values || []));
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error("Error en fetchData:", e);
        } finally {
            if (!abortControllerRef.current?.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        fetchData();
        return () => {
            document.body.style.overflow = 'unset';
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [fetchData]);

    const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);

            const processed = rows.map(row => {
                const nombre = row.NombreCompleto || row.nombre || "";
                const rutRaw = String(row.RUT || "");
                const correo = row.Correo || row.Email || "";
                const unidadNombre = row.UnidadInstitucional || row.Unidad || "";

                const unidadEncontrada = unidades.find(u =>
                    String(u.nombre).toLowerCase().trim() === String(unidadNombre).toLowerCase().trim()
                );

                return {
                    nombreCompleto: nombre,
                    rut: rutRaw.trim(),
                    correoElectronico: correo,
                    unidadNombre: unidadNombre,
                    idUnidad: unidadEncontrada?.idUnidad || unidadEncontrada?.id || null,
                    error: !unidadEncontrada ? "Unidad no válida" : null
                };
            });

            setExcelPreview(processed);
            setShowExcelModal(true);
            e.target.value = "";
        };
        reader.readAsBinaryString(file);
    };

    const confirmBatchImport = async () => {
        setIsImporting(true);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        try {
            for (const item of excelPreview) {
                if (item.error) continue;
                await fetch(`${API_BASE}/api/Funcionarios/crear`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        rut: item.rut,
                        correoElectronico: item.correoElectronico,
                        nombreCompleto: item.nombreCompleto,
                        idUnidad: Number(item.idUnidad)
                    })
                });
            }
            setShowExcelModal(false);
            fetchData();
        } catch (error) {
            console.error("Error en carga masiva:", error);
        } finally {
            setIsImporting(false);
        }
    };

    const unifiedData = useMemo(() => {
        const userMap = new Map();

        usuarios.forEach(u => {
            if (u.rut) {
                userMap.set(String(u.rut).trim().toLowerCase(), u);
            }
        });

        const unidadMap = new Map();
        unidades.forEach(uni => {
            const id = uni.idUnidad ?? uni.id;
            if (id) unidadMap.set(Number(id), uni);
        });

        const base = funcionarios.map(f => {
            const rutKey = String(f.rut || "").trim().toLowerCase();

            return {
                funcionario: {
                    ...f,
                    unidad: f.unidad || unidadMap.get(Number(f.idUnidad))
                },
                usuario: userMap.get(rutKey) || null
            };
        }).filter(item => !currentUserId || item.usuario?.idPersona !== currentUserId);

        if (!search) return base;

        const q = search.toLowerCase();
        return base.filter(item =>
            item.funcionario.rut.toLowerCase().includes(q) ||
            item.funcionario.nombreCompleto?.toLowerCase().includes(q) ||
            item.funcionario.unidad?.nombre?.toLowerCase().includes(q)
        );
    }, [funcionarios, usuarios, unidades, search, currentUserId]);

    return (
        <div className="h-screen w-full bg-[#002855] font-sans text-white overflow-hidden flex flex-col relative">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-5" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover' }} />

            <main className="relative z-10 flex-1 p-6 pt-28 mb-4 flex justify-center overflow-hidden">
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-7xl h-full flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855] relative">

                    <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0 relative">
                        <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10"><ShieldCheck size={24} /></div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-none text-white">Control de <br /><span className="text-blue-400">Funcionarios</span></h2>
                        <div className="w-8 h-1 bg-blue-500 mb-6" />

                        <div className="space-y-6">
                            <div>
                                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-2 block">Búsqueda Rápida</label>
                                <input
                                    type="text"
                                    placeholder="FILTRAR..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-blue-400 transition-colors"
                                />
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="w-full py-3 px-4 border border-emerald-400/30 bg-emerald-400/5 hover:bg-emerald-400/20 text-emerald-400 flex items-center justify-center gap-3 transition-all group rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.05)]"
                                >
                                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Descargar Plantilla</span>
                                </button>
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 hover:border-blue-400 hover:bg-white/5 transition-all cursor-pointer rounded-sm group">
                                    <FileSpreadsheet size={20} className="text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors text-center px-4">Importar Excel</p>
                                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white flex flex-col overflow-hidden relative text-slate-900">
                        <div className="grid grid-cols-2 bg-slate-200 border-b border-slate-300 px-10 py-3 text-[10px] font-black text-[#002855] uppercase tracking-[0.2em] z-10 shadow-sm">
                            <div>Apartado Funcionario</div>
                            <div className="pl-10">Apartado Usuario</div>
                        </div>

                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200 z-0 hidden lg:block" />

                        <div className="flex-1 relative z-10 bg-white">
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <RefreshCw className="animate-spin text-blue-600" size={32} />
                                        <span className="text-[#002855] font-black text-xs uppercase tracking-[0.3em]">Sincronizando...</span>
                                    </div>
                                </div>
                            ) : (
                                <Virtuoso
                                    data={unifiedData}
                                    className="custom-list-scroll"
                                    itemContent={(_, row) => (
                                        <IdentityRow
                                            data={row}
                                            onSelect={currentUserRole === 1 ? setSelectedFunc : null}
                                            isRestricted={currentUserRole !== 1}
                                        />
                                    )}
                                />
                            )}
                        </div>

                        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 z-50">
                            <button
                                onClick={() => setSelectedFunc({ funcionario: { rut: '', nombreCompleto: '', correoElectronico: '' }, usuario: null })}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-[0_10px_30px_rgba(0,40,85,0.4)] transition-all active:scale-95 border-2 border-white/20"
                            >
                                <Plus size={32} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <AnimatePresence>
                {selectedFunc && (
                    <ModalGestionFuncionario
                        item={selectedFunc}
                        unidades={unidades}
                        onClose={() => setSelectedFunc(null)}
                        onRefresh={fetchData}
                        isAdmin={currentUserRole === 1}
                    />
                )}

                {showExcelModal && (
                    <ModalExcelPreview
                        data={excelPreview}
                        loading={isImporting}
                        onClose={() => setShowExcelModal(false)}
                        onConfirm={confirmBatchImport}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const handleDownloadTemplate = () => {
    const templatePath = '/CargaMassiva.xlsx'; 
    const link = document.createElement('a');
    link.href = templatePath;
    link.download = 'Plantilla_Carga_Funcionarios.xlsx'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ModalExcelPreview = ({ data, onClose, onConfirm, loading }: any) => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#001a35]/90 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl rounded-sm overflow-hidden">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-[#002855] uppercase tracking-tighter">Previsualización de Carga</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.length} registros encontrados en el archivo</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                            <th className="pb-4 px-2">Nombre</th>
                            <th className="pb-4 px-2">RUT</th>
                            <th className="pb-4 px-2">Correo</th>
                            <th className="pb-4 px-2">Unidad</th>
                            <th className="pb-4 px-2 text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                        {data.map((row: any, i: number) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-2 uppercase text-[#002855]">{row.nombreCompleto}</td>
                                <td className="py-4 px-2 font-mono text-slate-500">{row.rut}</td>
                                <td className="py-4 px-2 lowercase text-slate-500">{row.correoElectronico}</td>
                                <td className="py-4 px-2">
                                    <span className={row.idUnidad ? "text-emerald-600" : "text-red-500"}>
                                        {row.unidadNombre || "No definida"}
                                    </span>
                                </td>
                                <td className="py-4 px-2 text-right">
                                    {row.error ? (
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase italic">Error</span>
                                    ) : (
                                        <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Válido</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-8 bg-slate-50 border-t flex justify-end gap-6 items-center">
                <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors">Cancelar Operación</button>
                <button
                    onClick={onConfirm}
                    disabled={loading || data.some((r: any) => r.error)}
                    className="bg-[#002855] text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-blue-900/20"
                >
                    {loading ? "PROCESANDO..." : "IMPORTAR REGISTROS"}
                </button>
            </div>
        </motion.div>
    </div>
);

const IdentityRow = memo(({ data, onSelect, isRestricted }: any) => {
    const isLinked = !!data.usuario;
    const infoStyle = "text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5";
    return (
        <div className="px-6 py-2 bg-transparent">
            <motion.div
                whileHover={onSelect ? { y: -3 } : {}}
                whileTap={onSelect ? { scale: 0.995 } : {}}
                transition={FAST_TRANSITION}
                onClick={() => onSelect && onSelect(data)}
                className={`group bg-white border p-6 flex items-center justify-between gap-6 hover:shadow-xl transition-all duration-150 relative overflow-hidden will-change-transform
                    ${!isLinked ? 'grayscale border-slate-200 opacity-90' : 'border-slate-200'} 
                    ${!onSelect ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-transform duration-150 origin-top 
                    ${isLinked ? 'bg-blue-600' : 'bg-amber-500'} 
                    scale-y-0 group-hover:scale-y-100`}
                />
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-sm flex items-center justify-center shrink-0 shadow-inner transition-colors
                        ${isLinked ? 'bg-slate-100 text-[#002855] group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {isLinked ? <UserCheck size={26} /> : <User size={26} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className={`text-lg font-black uppercase tracking-tighter truncate transition-colors duration-150 
                                ${isLinked ? 'text-[#002855] group-hover:text-blue-600' : 'text-slate-500'}`}>
                                {data.funcionario.nombreCompleto}
                            </h3>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter 
                                ${isLinked ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                {isLinked ? 'En Sistema' : 'Sin Usuario'}
                            </span>
                        </div>
                        <span className={infoStyle}>{data.funcionario.rut}</span>
                        {data.funcionario.unidad?.nombre && (
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                                    <Boxes size={10} className="text-emerald-600" />
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
                                        {data.funcionario.unidad.nombre}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                    {isRestricted ? (
                        <div className="flex items-center gap-2 text-slate-300 italic">
                            <LockIcon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Protegido</span>
                        </div>
                    ) : isLinked ? (
                        <div className="flex items-center gap-10 border-l border-slate-100 pl-8">
                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                                <span className={infoStyle} title={data.funcionario.correoElectronico}>
                                    <Mail size={10} /> {data.funcionario.correoElectronico}
                                </span>
                                <span className={infoStyle}>ID: {data.usuario.idPersona}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 min-w-[120px]">
                                <span className={`${infoStyle} ${data.usuario.rol === 1 ? 'text-blue-700' : 'text-slate-500'}`}>
                                    {data.usuario.rol === 1 ? 'Administrador' : 'Funcionario'}
                                </span>
                                <span className={infoStyle}>
                                    {new Date(data.usuario.fechaCreacion).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border border-amber-100 rounded-sm">
                            <ShieldAlert size={20} className="text-amber-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-amber-700 uppercase leading-none">Acceso Pendiente</span>
                                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter mt-1">Requiere Alta</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
});

const ModalGestionFuncionario = ({ item, onClose, onRefresh, isAdmin, unidades }: any) => {
    const isNew = !item.funcionario.rut;
    const isLinked = !!item.usuario;

    const [saving, setSaving] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nombre, setNombre] = useState(item.funcionario.nombreCompleto || '');
    const [rut, setRut] = useState(item.funcionario.rut || '');
    const [email, setEmail] = useState(item.funcionario.correoElectronico || '');
    const [rol, setRol] = useState<number>(item.usuario?.rol || 2);
    const [password, setPassword] = useState('');
    const [idUnidad, setIdUnidad] = useState<number | string>(item.funcionario.idUnidad || '');

    useEffect(() => {
        if (isNew && unidades?.length > 0 && !idUnidad) {
            const ultima = unidades[unidades.length - 1];
            setIdUnidad(ultima.idUnidad ?? ultima.id);
        }
    }, [unidades, isNew]);

    const canSubmit = useMemo(() => {
        if (isNew) return !!(nombre.trim() && rut.trim() && email.trim() && idUnidad && (isAdmin ? password.length >= 4 : true));
        return true;
    }, [nombre, rut, email, password, idUnidad, isNew, isAdmin]);

    const handleSave = async () => {
        if (!canSubmit) return;
        setSaving(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        try {
            if (isNew) {
                const resF = await fetch(`${API_BASE}/api/Funcionarios/crear`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        rut: rut.trim(),
                        correoElectronico: email.trim(),
                        nombreCompleto: nombre.trim(),
                        idUnidad: Number(idUnidad)
                    })
                });
                if (!resF.ok) throw new Error(await resF.text() || "Error al registrar funcionario");

                if (isAdmin && password.trim()) {
                    const fd = new FormData();
                    fd.append('Rut', rut.trim());
                    fd.append('Rol', String(rol));
                    fd.append('Contrasena', password);
                    await fetch(`${API_BASE}/api/Users`, {
                        method: 'POST',
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: fd
                    });
                }
            } else if (isAdmin) {
                const bodyFunc = {
                    rut: item.funcionario.rut,
                    correoElectronico: email.trim() || item.funcionario.correoElectronico,
                    nombreCompleto: nombre.trim() || item.funcionario.nombreCompleto,
                    idUnidad: Number(idUnidad)
                };

                if (isLinked) {
                    const bodyUser = {
                        idPersona: Number(item.usuario.idPersona),
                        contrasena: password || "",
                        rol: Number(rol),
                        rut: item.funcionario.rut
                    };
                    await Promise.all([
                        fetch(`${API_BASE}/api/Funcionarios/editar`, { method: 'PATCH', headers, body: JSON.stringify(bodyFunc) }),
                        fetch(`${API_BASE}/api/Users`, { method: 'PATCH', headers, body: JSON.stringify(bodyUser) })
                    ]);
                } else {
                    await fetch(`${API_BASE}/api/Funcionarios/editar`, { method: 'PATCH', headers, body: JSON.stringify(bodyFunc) });
                    const fd = new FormData();
                    fd.append('Rut', item.funcionario.rut);
                    fd.append('Rol', String(rol));
                    fd.append('Contrasena', password);
                    await fetch(`${API_BASE}/api/Users`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
                }
            }
            onRefresh();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001a35]/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl h-[80vh] flex shadow-[0_40px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#002855]">
                <div className="hidden md:flex w-72 p-10 flex-col border-y border-l border-white/10 shrink-0 text-white relative">
                    <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mb-8 shadow-lg border border-white/10"><Fingerprint size={24} /></div>
                    <h2 className="text-3xl font-black uppercase mb-2 leading-none">{isNew ? 'Registrar' : isLinked ? 'Editar' : 'Alta de'}<br /><span className="text-blue-400">{isNew ? 'Personal' : isLinked ? 'Usuario' : 'Acceso'}</span></h2>
                    <div className="w-8 h-1 bg-blue-500 mb-6" />
                </div>
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative text-slate-900">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#002855] transition-colors z-20"><X size={24} /></button>
                    <div className="flex-1 overflow-y-auto p-10 md:p-14 pt-20 custom-list-scroll">
                        {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-3"><AlertCircle size={16} />{error}</div>}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 pb-2"><h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Ficha del Funcionario</h3></div>
                                <div>
                                    <label className={LABEL_STYLE}><User size={12} /> Nombre Completo *</label>
                                    <input className={INPUT_STYLE} value={nombre} onChange={e => setNombre(e.target.value)} disabled={!isAdmin && !isNew} />
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}><Hash size={12} /> RUT *</label>
                                    <input className={INPUT_STYLE} value={rut} onChange={e => setRut(e.target.value)} disabled={!isNew} />
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}><Mail size={12} /> Correo *</label>
                                    <input className={INPUT_STYLE} value={email} onChange={e => setEmail(e.target.value)} disabled={!isNew && !isAdmin} />
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}><Building2 size={12} /> Unidad Institucional *</label>
                                    <select className={INPUT_STYLE} value={idUnidad} onChange={e => setIdUnidad(e.target.value)} disabled={!isAdmin && !isNew}>
                                        <option value="" disabled>Seleccione unidad</option>
                                        {unidades.map((u: any) => (
                                            <option key={u.idUnidad ?? u.id} value={u.idUnidad ?? u.id}>{u.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={`space-y-8 ${(isNew && !isAdmin) ? 'opacity-30 pointer-events-none' : ''}`}>
                                <div className="border-b border-slate-100 pb-2"><h3 className="text-[11px] font-black text-[#002855] uppercase tracking-[0.2em]">Seguridad y Rol</h3></div>
                                <div className="relative">
                                    <label className={LABEL_STYLE}><Lock size={12} /> {isLinked ? 'Cambiar Contraseña' : 'Contraseña de Acceso *'}</label>
                                    <input type={showPass ? "text" : "password"} className={INPUT_STYLE} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" placeholder={isLinked ? "VACÍO PARA MANTENER" : "MÍNIMO 4 CARACTERES"} disabled={!isAdmin && !isNew} />
                                    {isAdmin && <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-9 text-slate-400">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                                </div>
                                <div>
                                    <label className={LABEL_STYLE}> Rol de Sistema</label>
                                    <select className={INPUT_STYLE} value={rol} onChange={e => setRol(Number(e.target.value))} disabled={!isAdmin}>
                                        <option value={1}>Administrador</option>
                                        <option value={2}>Funcionario</option>
                                    </select>
                                </div>
                                <div className="p-4 rounded-sm border bg-blue-50 border-blue-100">
                                    <div className="flex gap-3">
                                        <Info size={16} className="text-[#002855] shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-slate-700 font-extrabold uppercase tracking-tight leading-relaxed">
                                            {isNew ? "Al registrar, se creará la ficha básica y el acceso de usuario." : "Solo los cambios confirmados afectarán al sistema."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(isAdmin || isNew) && (
                        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 z-50">
                            <span className="text-[10px] font-black text-[#002855] uppercase tracking-widest opacity-40">
                                {saving ? 'Procesando...' : isNew ? 'Registrar Personal' : 'Confirmar Cambios'}
                            </span>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !canSubmit}
                                className="h-16 w-16 rounded-full bg-[#002855] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 shadow-xl transition-all disabled:bg-slate-200"
                            >
                                {saving ? <RefreshCw className="animate-spin" size={28} /> : <Save size={28} />}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};