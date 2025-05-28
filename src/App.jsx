import React, { useState } from 'react';
import LoginForm from './Login';
import Layout from './pages/Layout';             // layout dengan lokasi + logout
import CurahHujanContent from './pages/CurahHujan/CurahHujanContent'; // komponen curah hujan
import bgImage from './assets/petani.jpg';

const lokasiOptions = [
  { label: 'Kuningan', lat: -6.9775, lon: 108.4747 },
  { label: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { label: 'Bandung', lat: -6.9175, lon: 107.6191 },
];

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [lokasi, setLokasi] = useState(lokasiOptions[0]);

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
        {/* Overlay gelap */}
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

  // Setelah login, tampilkan layout + konten aplikasi
  return (
    <Layout lokasi={lokasi} onLokasiChange={setLokasi}>
      {/* Bisa tambahkan komponen lain di sini sesuai kebutuhan */}
      <CurahHujanContent lokasi={lokasi} />
    </Layout>
  );
}
