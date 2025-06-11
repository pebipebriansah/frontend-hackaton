import React, { useEffect, useState } from 'react';
import {
  Container,
  Navbar,
  Nav,
  Button,
  Offcanvas,
  Form,
  Alert,
  Dropdown,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const API_KEY = '1c5b30d80951b00f89c53bf2d5edc088';

function Layout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [lokasi, setLokasi] = useState({
    label: 'Menunggu GPS...',
    lat: null,
    lon: null,
  });
  const [curahHujan, setCurahHujan] = useState(null);
  const [loadingCuaca, setLoadingCuaca] = useState(false);
  const [error, setError] = useState(null);
  const [gpsAktif, setGpsAktif] = useState(false);

  const navigate = useNavigate();

  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  const namaUser = localStorage.getItem('nama_petani') || 'Petani';
  const idPetani = localStorage.getItem('id_petani');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/Login');
  };

  const getCurahHujan = async (lat, lon) => {
    if (!lat || !lon) return;
    try {
      setLoadingCuaca(true);
      setError(null);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error('Gagal mengambil data cuaca');
      const data = await res.json();

      const hariIni = new Date().toISOString().split('T')[0];
      const dataHariIni = data.list.find((d) => d.dt_txt.startsWith(hariIni));
      const rain = dataHariIni?.rain?.['3h'] || 0;

      setCurahHujan(rain);

      if (idPetani) {
        await simpanDataCuaca(rain, lat, lon, lokasi.label);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data cuaca');
    } finally {
      setLoadingCuaca(false);
    }
  };

  const simpanDataCuaca = async (rainValue, lat, lon, lokasiLabel) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan, silakan login ulang');
        return;
      }

      const response = await fetch(
        'https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/cuaca/cuaca/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_petani: parseInt(idPetani, 10),
            lokasi: lokasiLabel,
            latitude: lat,
            longitude: lon,
            curah_hujan: rainValue,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menyimpan data cuaca');
      }

      console.log('Data cuaca berhasil disimpan ke backend');
    } catch (err) {
      setError(err.message);
    }
  };

  const gunakanGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setError(null);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'PetaniCerdasApp/1.0 (contact@petanicerdas.com)',
                'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
              },
            }
          );
          if (!res.ok) throw new Error('Gagal mengambil alamat dari koordinat GPS');
          const data = await res.json();

          const address = data.address || {};
          const label =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            data.display_name ||
            'Lokasi GPS';

          setLokasi({ label, lat: latitude, lon: longitude });
          setGpsAktif(true);
        } catch (err) {
          setError(err.message || 'Gagal mengambil alamat dari koordinat GPS');
        }
      },
      (err) => setError('Gagal mendapatkan GPS: ' + err.message)
    );
  };

  useEffect(() => {
    if (gpsAktif && lokasi.lat && lokasi.lon) {
      getCurahHujan(lokasi.lat, lokasi.lon);
    }
  }, [gpsAktif, lokasi]);

  const getCurahHujanDesc = (value) => {
    if (value === 0) return 'Tidak ada hujan';
    if (value < 2.5) return 'Hujan ringan';
    if (value < 7.6) return 'Hujan sedang';
    return 'Hujan lebat';
  };

  return (
    <>
      {/* Navbar */}
      <Navbar
        expand={false}
        bg="success"
        variant="dark"
        fixed="top"
        style={{
          boxShadow: '0 2px 10px rgb(0 0 0 / 0.15)',
          backdropFilter: 'blur(12px)',
          zIndex: 1040,
          padding: '0.6rem 1rem',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <Container fluid className="d-flex align-items-center">
          {/* Tombol Menu Sidebar */}
          <Button
            variant="outline-light"
            onClick={toggleSidebar}
            className="me-3"
            style={{ fontSize: '1.8rem', width: 48, height: 48, borderRadius: 8 }}
            aria-label="Buka Menu"
          >
            ☰
          </Button>

          {/* Nama App */}
          <Navbar.Brand
            className="fw-bold"
            style={{ fontSize: '1.7rem', letterSpacing: 1, userSelect: 'none' }}
          >
            Cengek
          </Navbar.Brand>

          <div className="flex-grow-1" />

          {/* Curah Hujan dan GPS Button */}
          <Form className="d-flex align-items-center gap-3 me-2">
            {curahHujan !== null && !loadingCuaca && (
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#d4edda',
                  backgroundColor: 'rgba(0, 100, 0, 0.7)',
                  padding: '6px 12px',
                  borderRadius: 12,
                  userSelect: 'none',
                  minWidth: 180,
                  textAlign: 'center',
                }}
                title={`Curah hujan saat ini di lokasi ${lokasi.label}`}
              >
                💧 {getCurahHujanDesc(curahHujan)}
              </div>
            )}
            <Button
              variant="outline-light"
              size="md"
              style={{ fontWeight: '600', minWidth: 140, borderRadius: 8 }}
              onClick={gunakanGPS}
              disabled={loadingCuaca}
              aria-label="Cari lokasi dengan GPS"
            >
              {loadingCuaca ? 'Memuat...' : '📍 Cari Lokasi Saya'}
            </Button>
          </Form>

          {/* Dropdown Nama User & Logout */}
          <Dropdown align="end" className="me-1">
            <Dropdown.Toggle
              variant="outline-light"
              id="dropdown-basic"
              style={{
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: 100,
                borderRadius: 8,
                userSelect: 'none',
              }}
            >
              👩‍🌾 {namaUser}
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ minWidth: 120 }}>
              <Dropdown.Item
                onClick={handleLogout}
                className="text-danger"
                style={{ fontWeight: '600' }}
              >
                Keluar
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Navbar>

      {/* Sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={toggleSidebar}
        backdrop={true}
        scroll={false}
        style={{ width: '260px' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title style={{ fontWeight: '700', fontSize: '1.4rem' }}>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column fs-5" style={{ gap: '1.2rem' }}>
            <Nav.Link
              as={Link}
              to="/dashboard"
              onClick={toggleSidebar}
              style={{ padding: '12px 16px', borderRadius: 8 }}
              className="text-success fw-semibold"
            >
              🏠 Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/deteksi-penyakit"
              onClick={toggleSidebar}
              style={{ padding: '12px 16px', borderRadius: 8 }}
              className="text-success fw-semibold"
            >
              🐞 Deteksi Penyakit
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Konten Utama */}
      <main
        style={{
          marginTop: '70px',
          padding: '2rem 3rem',
          minHeight: 'calc(100vh - 70px - 50px)',
          backgroundColor: '#e9f5ea',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <Container fluid>
          {React.Children.map(children, (child) =>
            React.isValidElement(child) ? React.cloneElement(child, { lokasi, curahHujan }) : child
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer
        style={{
          height: '50px',
          backgroundColor: '#d4edda',
          borderTop: '1px solid #a8d5a8',
          textAlign: 'center',
          lineHeight: '50px',
          color: '#2e7d32',
          fontWeight: '600',
          fontSize: '1rem',
          userSelect: 'none',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        &copy; 2025 Cengek — Semua hak dilindungi.
      </footer>

      {/* Error alert */}
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          style={{ position: 'fixed', bottom: 10, right: 10, minWidth: 280, fontSize: '0.9rem' }}
        >
          ⚠️ {error}
        </Alert>
      )}
    </>
  );
}

export default Layout;
