// src/utils/SwalService.ts
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
export const ui = {
    confirmar: async (titulo: string, texto: string) => {
        const result = await MySwal.fire({
            title: titulo.toUpperCase(),
            text: texto,
            
            showCancelButton: true,
            confirmButtonColor: '#002855', // Tu color principal
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            background: '#ffffff',
            customClass: {
                title: 'font-black tracking-tighter',
                confirmButton: 'rounded-none font-bold tracking-widest',
                cancelButton: 'rounded-none font-bold tracking-widest'
            }
        });
        return result.isConfirmed;
    },

    exito: (titulo: string, msj: string = '') => {
        MySwal.fire({
            title: titulo.toUpperCase(),
            text: msj,
            icon: 'success',
            confirmButtonColor: '#002855',
            timer: 2000
        });
    },

    error: (msj: string) => {
        MySwal.fire({
            title: 'ERROR DE SISTEMA',
            text: msj,
            icon: 'error',
            confirmButtonColor: '#002855',
        });
    }
};