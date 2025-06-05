import 'bootstrap/dist/css/bootstrap.min.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App.jsx'           // Halaman utama
import LoginForm from '@/pages/Auth/Login.jsx'   // Halaman login
import RegisterForm from '@/pages/Auth/Register.jsx' //e Halaman register
import Dashboard from '@/pages/Dashboard/Dashboard.jsx'
import PriceRange from '@/pages/PriceRange/PriceRange.jsx'
import Layout from '@/pages/Layout.jsx'
import CurahHujan from '@/pages/CurahHujan/CurahHujan.jsx'
import DeteksiPenyakit from '@/pages/DeteksiPenyakit/DeteksiPenyakit.jsx'
import ProtectedRoute from '@/ProtectedRoutes.jsx'

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
            <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
            </ProtectedRoute>
            
          }
        />
        <Route
          path="/curahhujan"
          element={
            <ProtectedRoute>
            <Layout>
              <CurahHujan />
            </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-range"
          element={
            <ProtectedRoute>
            <Layout>
              <PriceRange hargaBulanIni={25000} />
            </Layout>
            </ProtectedRoute>
          }
        />
          <Route
          path="/deteksi-penyakit"
          element={
            <ProtectedRoute>
            <Layout>
              <DeteksiPenyakit />
            </Layout>
            </ProtectedRoute>
          }
        />      
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
