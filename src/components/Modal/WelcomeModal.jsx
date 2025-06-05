import React from 'react';

export default function WelcomeModal({ namaPetani, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
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
          onClick={onClose}
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
  );
}
