import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from './assets/petani.jpg';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [namaPetani, setNamaPetani] = useState('');
  const [showModal, setShowModal] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Login gagal');
      }

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nama_petani', data.nama_petani);
        setNamaPetani(data.nama_petani);
        setShowModal(true); // Tampilkan modal
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={handleSubmit}
        aria-label="Form login petani"
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '360px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Login Petani</h2>

        {error && (
          <p role="alert" style={{ color: 'red', marginBottom: '1rem', fontWeight: '600' }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
          autoComplete="email"
          aria-label="Email"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
          autoComplete="current-password"
          aria-label="Password"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#A5D6A7' : '#388E3C',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
            marginBottom: '1rem',
          }}
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>

        <p style={{ fontSize: '0.9rem', color: '#555' }}>
          Belum punya akun?{' '}
          <Link
            to="/register"
            style={{ color: '#388E3C', textDecoration: 'none', fontWeight: '600' }}
          >
            Daftar di sini
          </Link>
        </p>
      </form>

      {/* Modal Selamat Datang */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
              Selamat datang, <span style={{ color: '#388E3C' }}>{namaPetani}</span>!
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#555' }}>
              Anda berhasil login ke sistem.
            </p>
            <button
              onClick={handleCloseModal}
              style={{
                backgroundColor: '#388E3C',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Lanjut ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
