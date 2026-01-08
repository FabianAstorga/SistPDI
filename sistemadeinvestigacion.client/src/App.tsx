import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom'
import React from 'react'
import Login from './assets/Routes/Admin/login'
import Panel from './assets/Routes/Admin/panel'

function Home() {
  const navigate = useNavigate()

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Hola papus</h1>
      <div className="card">
              <button onClick={() => navigate('/login')}>
              <p>Mostrar Login</p>
            </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />}></Route>
            <Route path="/panel" element={<Panel />}></Route>
        </Routes>
    )
}
export default App
