import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import bgImage from '../../assets/petani.jpg';
import WelcomeModal from '../../components/Modal/WelcomeModal';
import InputField from '../../components/Input/InputField';
import ButtonPrimary from '../../components/Button/ButtonPrimary';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [namaPetani, setNamaPetani] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('email', data.email);
      localStorage.setItem('nama_petani', data.nama_petani);
      localStorage.setItem('id_petani', data.id_petani);
      localStorage.setItem('isLoggedIn', 'true');

      setNamaPetani(data.nama_petani);
      setShowModal(true);
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
      className={styles.container}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <form onSubmit={handleSubmit} aria-label="Form login petani" className={styles.form}>
        <h2 className={styles.title}>Login Petani</h2>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <InputField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={loading}
          autoComplete="email"
          ariaLabel="Email"
        />

        <InputField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={loading}
          autoComplete="current-password"
          ariaLabel="Password"
        />

        <ButtonPrimary type="submit" loading={loading}>
          Login
        </ButtonPrimary>

        <p className={styles.registerText}>
          Belum punya akun?{' '}
          <Link to="/register" className={styles.registerLink}>
            Daftar di sini
          </Link>
        </p>
      </form>

      {showModal && <WelcomeModal namaPetani={namaPetani} onClose={handleCloseModal} />}
    </div>
  );
}
