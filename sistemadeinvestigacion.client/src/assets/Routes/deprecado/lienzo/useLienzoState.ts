import { useState, useEffect, useCallback } from 'react';
import type { Elemento, TipoElemento } from './types';

export const useLienzoState = () => {
    const [elementos, setElementos] = useState<Elemento[]>([]);
    const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

    useEffect(() => {
        const temp = localStorage.getItem('temp_acuerdo');
        if (temp) {
            try {
                const acuerdo = JSON.parse(temp);
                setElementos(prev => {
                    if (prev.length > 0) return prev;
                    const ahora = Date.now();
                    return [
                        {
                            id: ahora,
                            type: 'texto',
                            text: acuerdo.titulo || 'Sin Título',
                            x: 100, y: 100,
                            width: 500, height: 100,
                            fontSize: 32,
                            fill: '#002855',
                            fontWeight: 'bold',
                            rotation: 0
                        },
                        {
                            id: ahora + 1,
                            type: 'texto',
                            text: acuerdo.descripcion || 'Sin descripción breve',
                            x: 100, y: 160,
                            width: 500, height: 80,
                            fontSize: 18,
                            fill: '#1e293b',
                            fontWeight: '600',
                            rotation: 0
                        },
                        {
                            id: ahora + 2,
                            type: 'texto',
                            text: acuerdo.detallesDescripcion || '',
                            x: 100, y: 210,
                            width: 600, height: 300,
                            fontSize: 14,
                            fill: '#64748b',
                            rotation: 0
                        }
                    ];
                });
            } catch (error) {
                console.error("Error parseando temp_acuerdo:", error);
            }
        }
    }, []);

    const actualizarAtributo = useCallback((id: number, cambios: Partial<Elemento>) => {
        setElementos(prev => prev.map(el => el.id === id ? { ...el, ...cambios } : el));
    }, []);

    // Nueva función para Redimensionar
    const redimensionarElemento = useCallback((id: number, width: number, height: number) => {
        setElementos(prev => prev.map(el => el.id === id ? { ...el, width, height } : el));
    }, []);

    const agregarElemento = useCallback((tipo: TipoElemento) => {
        const ahora = Date.now();
        const nuevo: Elemento = {
            id: ahora,
            type: tipo,
            x: 150, y: 150,
            width: tipo === 'texto' ? 250 : 100,
            height: 100,
            fill: tipo === 'texto' ? '#1e293b' : '#3b82f6',
            rotation: 0,
            ...(tipo === 'texto' && { text: 'Nuevo Texto', fontSize: 20 }),
            ...(tipo === 'lapiz' && { points: '', strokeWidth: 3 }),
        };
        setElementos(prev => [...prev, nuevo]);
        setSeleccionadoId(ahora);
    }, []);

    const eliminarElemento = useCallback((id: number) => {
        setElementos(prev => prev.filter(el => el.id !== id));
        setSeleccionadoId(null);
    }, []);

    const moverCapa = useCallback((id: number, direccion: 'arriba' | 'abajo') => {
        setElementos(prev => {
            const index = prev.findIndex(el => el.id === id);
            if (index === -1) return prev;
            const nuevaLista = [...prev];
            const [elemento] = nuevaLista.splice(index, 1);
            const nuevoIndex = direccion === 'arriba' ? index + 1 : index - 1;
            const indexFinal = Math.max(0, Math.min(nuevaLista.length, nuevoIndex));
            nuevaLista.splice(indexFinal, 0, elemento);
            return nuevaLista;
        });
    }, []);

    return {
        elementos,
        setElementos,
        seleccionadoId,
        setSeleccionadoId,
        actualizarAtributo,
        redimensionarElemento, // Exportar esta
        agregarElemento,
        eliminarElemento,
        moverCapa
    };
};