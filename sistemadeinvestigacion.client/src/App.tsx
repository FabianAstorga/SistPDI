
import './App.css'
import {  Route, Routes } from 'react-router-dom'
import React from 'react'
//import Login from './assets/Routes/Admin/login'
import Panel from './assets/Routes/Admin/panel'
import { Lienzo } from './assets/Routes/Admin/ElementosLienzo/Lienzo';
import Configuracion from './assets/Routes/Admin/configuracion';
import Acuerdos from './assets/Routes/Admin/acuerdos';
import Institucion from './assets/Routes/Admin/institucion';
import Empleado from './assets/Routes/Admin/Empleado';
import ListarAcuerdos from './assets/Routes/Admin/listarAcuerdos';
import InstitucionList from './assets/Routes/Admin/institucionList';
import { RouteGuard } from './assets/Routes/Admin/RouteGuard'



function App() {
    return (
        <Routes>
            <Route path="/" element={<Panel />} />

            <Route path="/panel" element={<Panel />} />

            <Route element={<RouteGuard />}>
                
                <Route path="/lienzo" element={<Lienzo />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/acuerdos" element={<Acuerdos />} />
                <Route path="/listarAcuerdos" element={<ListarAcuerdos />} />
                <Route path="/institucion" element={<Institucion />} />
                <Route path="/empleado" element={<Empleado />} />
                <Route path="/institucionList" element={<InstitucionList/>} />

            </Route>
        </Routes>
    )
}
export default App
