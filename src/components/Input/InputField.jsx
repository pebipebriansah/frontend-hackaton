// src/components/Input/InputField.jsx
import React from 'react';
import styles from './InputField.module.css';

export default function InputField({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  name,
  required = true,
  autoComplete,
  ariaLabel,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      required={required}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
      className={styles.input}
    />
  );
}
