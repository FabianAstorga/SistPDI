/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as signalR from "@microsoft/signalr";
interface SignalRContextType {
    connection: signalR.HubConnection | null;
}
const SignalRContext = createContext<SignalRContextType | undefined>(undefined);
export const SignalRProvider = ({ children }: { children: ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://172.25.7.107:5091/acuerdosHub", { 
                accessTokenFactory: () => localStorage.getItem('token') || ""
            })
            .withAutomaticReconnect()
            .build();
        newConnection.start()
            .then(() => {
                console.log("✅ Conectado al Socket de SignalR");
                setConnection(newConnection);
            })
            .catch(err => console.error("❌ Error conectando al Socket", err));
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

export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error("useSignalR debe usarse dentro de un SignalRProvider");
    }
    return context;
};