import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as signalR from "@microsoft/signalr";

// Definimos qué datos compartirá el Provider
interface SignalRContextType {
    connection: signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider = ({ children }: { children: ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        // 1. Configurar la conexión (Adaptado de tu ejemplo)
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5091/acuerdosHub", { // Ajusta a tu URL de C#
                // Como es una Intranet, probablemente necesites pasar el token
                accessTokenFactory: () => localStorage.getItem('token') || ""
            })
            .withAutomaticReconnect()
            .build();

        // 2. Iniciar la conexión
        newConnection.start()
            .then(() => {
                console.log("✅ Conectado al Socket de SignalR");
                setConnection(newConnection);
            })
            .catch(err => console.error("❌ Error conectando al Socket", err));

        // 3. Limpieza al cerrar la app
        return () => {
            newConnection.stop();
        };
    }, []);

    return (
        <SignalRContext.Provider value={{ connection }}>
            {children}
        </SignalRContext.Provider>
    );
};

// Hook personalizado para usar el socket en cualquier componente
export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error("useSignalR debe usarse dentro de un SignalRProvider");
    }
    return context;
};