
import './App.css'
import {  Route, Routes } from 'react-router-dom'
import React from 'react'
import Login from './assets/Routes/Admin/login'
import Panel from './assets/Routes/Admin/panel'
import { Lienzo } from './assets/Routes/Admin/lienzo';
import Configuracion from './assets/Routes/Admin/configuracion';
import Acuerdos from './assets/Routes/Admin/acuerdos';
import { RouteGuard } from './assets/Routes/Admin/RouteGuard'



function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />}></Route>
            <Route element={<RouteGuard />}>
                <Route path="/panel" element={<Panel />} />
                <Route path="/lienzo" element={<Lienzo />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/acuerdos" element={<Acuerdos />} />
            </Route>
        </Routes>
    )
}
export default App
