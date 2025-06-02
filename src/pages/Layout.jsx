
import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Offcanvas, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const API_KEY = '1c5b30d80951b00f89c53bf2d5edc088';

function Layout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [lokasi, setLokasi] = useState({ label: 'Menunggu GPS...', lat: null, lon: null });
  const [curahHujan, setCurahHujan] = useState(null);
  const [loadingCuaca, setLoadingCuaca] = useState(false);
  const [error, setError] = useState(null);
  const [gpsAktif, setGpsAktif] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('../Login');
  };

  const getCurahHujan = async (lat, lon) => {
    if (!lat || !lon) return;
    try {
      setLoadingCuaca(true);
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      const hariIni = new Date().toISOString().split('T')[0];
      const dataHariIni = data.list.find(d => d.dt_txt.startsWith(hariIni));
      const rain = dataHariIni?.rain?.['3h'] || 0;
      setCurahHujan(rain);
    } catch (err) {
      setError('Gagal mengambil data cuaca',err);
    } finally {
      setLoadingCuaca(false);
    }
  };

  const gunakanGPS = () => {
  if (!navigator.geolocation) {
    setError('Geolocation tidak didukung browser');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'User-Agent': 'PetaniCerdasApp/1.0 (contact@petanicerdas.com)',
              'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            },
          }
        );
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
        setError(null);
      } catch (err) {
        setError('Gagal mengambil alamat dari koordinat GPS',err);
      }
    },
    (err) => setError('Gagal mendapatkan GPS: ' + err.message)
  );
};


  useEffect(() => {
    if (gpsAktif && lokasi.lat && lokasi.lon) {
      getCurahHujan(lokasi.lat, lokasi.lon);
    }
  }, [lokasi, gpsAktif]);

  const getCurahHujanDesc = (value) => {
    if (value === 0) return 'tidak ada hujan';
    if (value < 2.5) return 'hujan ringan';
    if (value < 7.6) return 'hujan sedang';
    return 'hujan lebat';
  };

  return (
    <>
      {/* Navbar */}
      <Navbar
  expand={false}
  bg="light"
  fixed="top"
  style={{
    boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1040,
  }}
>
  <Container fluid className="d-flex align-items-center">
    {/* Tombol Menu Sidebar */}
    <Button variant="outline-success" onClick={toggleSidebar} className="me-3">
      &#9776;
    </Button>

    {/* Nama App */}
    <Navbar.Brand
      className="fw-bold"
      style={{ fontSize: '1.5rem', color: '#2E7D32', marginRight: '2rem' }}
    >
    Cengek
    </Navbar.Brand>

    {/* Spacer agar konten lain terdorong ke kanan */}
    <div className="flex-grow-1" />

    {/* Curah Hujan dan GPS Button */}
    <Form className="d-flex align-items-center gap-2 me-4">
      {curahHujan !== null && !loadingCuaca && (
        <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#2e7d32' }}>
          Curah hujan di <strong>{lokasi.label}</strong>: {getCurahHujanDesc(curahHujan)}
        </div>
      )}
      <Button variant="outline-primary" size="sm" style={{ marginLeft: '1rem', marginRight: '1rem' }} onClick={gunakanGPS}>
        Gunakan GPS
      </Button>
    </Form>

    {/* Logout */}
    <Nav className="me-3">
      <Nav.Link
        onClick={handleLogout}
        className="text-danger fw-semibold"
        style={{ cursor: 'pointer' }}
      >
        Logout
      </Nav.Link>
    </Nav>
  </Container>
</Navbar>


      {/* Sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={toggleSidebar}
        backdrop={true}
        scroll={false}
        style={{ width: '250px' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column fs-5">
            <Nav.Link as={Link} to="/dashboard" onClick={toggleSidebar}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/price-range" onClick={toggleSidebar}>
              Harga
            </Nav.Link>
            <Nav.Link as={Link} to="/deteksi-penyakit" onClick={toggleSidebar}>
              Deteksi Penyakit
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
          backgroundColor: '#f5f7fa',
        }}
      >
        <Container fluid>
  {React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { lokasi, curahHujan });
    }
    return child;
  })}
</Container>
      </main>

      {/* Footer */}
      <footer
        style={{
          height: '50px',
          backgroundColor: 'white',
          borderTop: '1px solid #eaeaea',
          textAlign: 'center',
          lineHeight: '50px',
          color: '#777',
          fontWeight: '500',
          fontSize: '0.9rem',
          userSelect: 'none',
        }}
      >
        &copy; 2025 PetaniCerdas — All rights reserved.
      </footer>

      {/* Error alert */}
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          style={{ position: 'fixed', bottom: 10, right: 10, minWidth: 250 }}
        >
          {error}
        </Alert>
      )}
    </>
  );
}

export default Layout;
