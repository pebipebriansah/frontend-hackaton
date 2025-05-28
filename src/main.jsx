import 'bootstrap/dist/css/bootstrap.min.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App.jsx'           // Halaman utama
import LoginForm from './Login.jsx'   // Halaman login
import RegisterForm from './Register.jsx' // Halaman register
import Dashboard from './pages/Dashboard.jsx'
import PriceRange from './pages/priceRange.jsx'
import Layout from './pages/Layout.jsx'
import CurahHujan from './pages/CurahHujan/CurahHujan.jsx'
import DeteksiPenyakit from './pages/DeteksiPenyakit/DeteksiPenyakit.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
         <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/curahhujan"
          element={
            <Layout>
              <CurahHujan />
            </Layout>
          }
        />
        <Route
          path="/price-range"
          element={
            <Layout>
              <PriceRange hargaBulanIni={25000} />
            </Layout>
          }
        />
          <Route
          path="/deteksi-penyakit"
          element={
            <Layout>
              <DeteksiPenyakit />
            </Layout>
          }
        />      
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
