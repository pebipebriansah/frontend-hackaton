import { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';

const API_KEY = '5fbde58f930ecfd455390687d3535a6f';

function getCurahHujanDesc(rain) {
  if (rain === 0) return 'Cerah';
  if (rain > 0 && rain <= 5) return 'Lumayan deras';
  if (rain > 5) return 'Deras';
  return '-';
}

function CurahHujanContent({ lokasi }) {
  const [curahHujan, setCurahHujan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lokasi) return;

    const fetchCurahHujan = async () => {
      setLoading(true);
      setError(null);
      setCurahHujan(null);

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lokasi.lat}&lon=${lokasi.lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) throw new Error('Gagal mengambil data');

        const data = await response.json();

        const now = new Date();
        const todayDate = now.toISOString().split('T')[0];

        const forecastAtNoon = data.list.find(
          (item) => item.dt_txt.startsWith(todayDate) && item.dt_txt.includes('12:00:00')
        );

        const rain = forecastAtNoon?.rain?.['3h'] ?? 0;

        setCurahHujan(rain);
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCurahHujan();
  }, [lokasi]);

  if (!lokasi) return <div>Pilih lokasi terlebih dahulu</div>;

  return (
    <Card
      style={{
        borderRadius: '15px',
        boxShadow: '0 6px 20px rgb(0 0 0 / 0.1)',
        padding: '1.5rem',
        backgroundColor: 'white',
        maxWidth: '400px',
        margin: 'auto',
      }}
    >
      <Card.Body>
        {loading && (
          <div className="text-center">
            <Spinner animation="border" role="status" />
            <div>Memuat data curah hujan...</div>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {curahHujan !== null && !loading && !error && (
          <div style={{ fontSize: '1.4rem', fontWeight: '600' }}>
            Curah hujan hari ini di{' '}
            <span className="text-success">{lokasi.label}</span>: {getCurahHujanDesc(curahHujan)}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default CurahHujanContent;
