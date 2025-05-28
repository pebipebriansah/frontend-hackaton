import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [namaPetani, setNamaPetani] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [pesan, setPesan] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPesan('');
    try {
      const response = await fetch('http://localhost:8080/api/petani/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_petani: namaPetani,
          email,
          password,
          alamat,
          telepon
        })
      });

      const data = await response.json();

       if (!response.ok) throw new Error(data.messages?.error || 'Registrasi gagal');

      setPesan('Registrasi berhasil! Silakan login.');

      // Otomatis pindah ke halaman login setelah 2 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4c3, #c8e6c9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#388E3C', textAlign: 'center' }}>Daftar Akun Petani</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {pesan && <p style={{ color: 'green', marginBottom: '1rem' }}>{pesan}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <label>Nama Petani</label>
          <input
            type="text"
            placeholder='Masukan Nama Petani'
            value={namaPetani}
            onChange={(e) => setNamaPetani(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Alamat</label>
          <input
            type="text"
            placeholder='Masukan Alamat Anda'
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input
            type="email"
            placeholder='Masukan Email Anda'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Telepon</label>
          <input
            type="text"
            placeholder='Masukan No Telepon'
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            placeholder='************'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#388E3C',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          Daftar
        </button>

        {pesan && <p style={{ marginTop: '1rem', color: '#d32f2f', textAlign: 'center' }}>{pesan}</p>}
      </form>
    </div>
  );
}
