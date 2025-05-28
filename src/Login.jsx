import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from './assets/petani.jpg';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      }

      alert('Login berhasil!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <p
            role="alert"
            style={{ color: 'red', marginBottom: '1rem', fontWeight: '600' }}
          >
            {error}
          </p>
        )}

        <label htmlFor="email" style={{ display: 'none' }}>
          Email
        </label>
        <input
          id="email"
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

        <label htmlFor="password" style={{ display: 'none' }}>
          Password
        </label>
        <input
          id="password"
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
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#2E7D32';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#388E3C';
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
    </div>
  );
}
