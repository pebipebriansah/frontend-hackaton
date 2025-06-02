import React, { useEffect, useState } from 'react';
import LoginForm from './Login';
import Layout from './pages/Layout'; // halaman dashboard
import bgImage from './assets/petani.jpg';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek session saat pertama kali load
  useEffect(() => {
    const session = sessionStorage.getItem('isLoggedIn');
    if (session === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Jika sudah login, langsung tampilkan dashboard
  if (isLoggedIn) {
    return <Layout />;
  }

  // Jika belum login dan belum klik "Mulai Aplikasi", tampilkan halaman pembuka
  if (!showLogin) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        />

        {/* Konten */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: '#fff',
            padding: '2rem',
            maxWidth: '90%',
            backdropFilter: 'blur(2px)',
          }}
        >
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>
            Selamat Datang, Petani!
          </h1>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.5 }}>
            Aplikasi ini akan membantu Anda memantau harga pasar dan menjual hasil panen secara langsung.
          </p>
          <button
            style={{
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '30px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setShowLogin(true)}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#388E3C')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4CAF50')}
          >
            Mulai Aplikasi
          </button>
        </div>
      </div>
    );
  }

  // Jika sudah klik "Mulai Aplikasi", tampilkan form login
  return <LoginForm onLoginSuccess={() => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  }} />;
}
