import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '@/components/Input/InputField';
import ButtonPrimary from '@/components/Button/ButtonPrimary';
import { registerUser } from '@/api/auth'; // ⬅️ Import API

export default function Register() {
  const [namaPetani, setNamaPetani] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [pesan, setPesan] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPesan('');
    setLoading(true);

    try {
      await registerUser({
        nama_petani: namaPetani,
        email,
        password,
        alamat,
        telepon,
      });

      setPesan('Registrasi berhasil! Silakan login.');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
        background: 'linear-gradient(135deg, #f0f4c3, #c8e6c9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ marginBottom: '1rem', color: '#388E3C', textAlign: 'center' }}>
          Daftar Akun Petani
        </h2>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {pesan && <p style={{ color: 'green', marginBottom: '1rem' }}>{pesan}</p>}

        <InputField
          type="text"
          placeholder="Masukan Nama Petani"
          value={namaPetani}
          onChange={(e) => setNamaPetani(e.target.value)}
          required
          ariaLabel="Nama Petani"
        />

        <InputField
          type="text"
          placeholder="Masukan Alamat Anda"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          required
          ariaLabel="Alamat"
        />

        <InputField
          type="email"
          placeholder="Masukan Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          ariaLabel="Email"
        />

        <InputField
          type="text"
          placeholder="Masukan No Telepon"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          required
          ariaLabel="Telepon"
        />

        <InputField
          type="password"
          placeholder="************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          ariaLabel="Password"
        />

        <ButtonPrimary type="submit" loading={loading}>
          Daftar
        </ButtonPrimary>

        {pesan && (
          <p style={{ marginTop: '1rem', color: '#2e7d32', textAlign: 'center' }}>
            {pesan}
          </p>
        )}
      </form>
    </div>
  );
}
