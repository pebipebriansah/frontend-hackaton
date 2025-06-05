// src/components/Button/ButtonPrimary.jsx
import React from 'react';
import styles from './ButtonPrimary.module.css';

export default function ButtonPrimary({ children, onClick, type = 'button', loading = false, disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${loading ? styles.loading : styles.active}`}
      disabled={loading || disabled}
    >
      {loading ? 'Memproses...' : children}
    </button>
  );
}
