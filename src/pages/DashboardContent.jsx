import { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Droplet, TrendingUp, TrendingDown } from 'lucide-react';

function DashboardContent({ lokasi, curahHujan, loading }) {
  const [hargaBulanIni, setHargaBulanIni] = useState(0);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(0);

  useEffect(() => {
    // Simulasi fetch data harga
    setHargaBulanIni(25000);
    setHargaBulanLalu(22000);
  }, []);

  // Deskripsi curah hujan berdasarkan angka (mm)
  const getCurahHujanDesc = (value) => {
    if (value === 0) return 'tidak ada hujan';
    if (value < 2.5) return 'hujan ringan';
    if (value < 7.6) return 'hujan sedang';
    return 'hujan lebat';
  };

  // Ambil angka curah hujan dari string "12 mm", atau kalau loading tampilkan "Memuat..."
  let curahHujanDisplay = 'Memuat...';
  if (!loading && curahHujan !== null) {
    // curahHujan diasumsikan dalam mm (angka), bisa juga string "12" atau "12 mm"
    let angkaCurah = typeof curahHujan === 'string' ? parseFloat(curahHujan) : curahHujan;
    if (isNaN(angkaCurah)) angkaCurah = 0;
    curahHujanDisplay = `${angkaCurah} mm (${getCurahHujanDesc(angkaCurah)})`;
  }

  const cards = [
    {
      title: `Curah Hujan (${lokasi?.label || 'Lokasi'})`,
      value: curahHujanDisplay,
      icon: <Droplet size={32} className="text-primary" />,
      color: '#E3F2FD',
    },
    {
      title: 'Harga Bulan Ini',
      value: hargaBulanIni.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
      icon: <TrendingUp size={32} className="text-success" />,
      color: '#E8F5E9',
    },
    {
      title: 'Harga Bulan Lalu',
      value: hargaBulanLalu.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
      icon: <TrendingDown size={32} className="text-danger" />,
      color: '#FFEBEE',
    },
  ];

  return (
    <>
      <h1 className="mb-4 fw-bold text-success">Dashboard</h1>
      <Row className="g-4 mb-4">
        {cards.map((card, idx) => (
          <Col key={idx} md={4}>
            <Card
              className="h-100"
              style={{
                borderRadius: '18px',
                backgroundColor: card.color,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                  {card.icon}
                  <Card.Title className="fw-semibold m-0" style={{ fontSize: '1.2rem' }}>
                    {card.title}
                  </Card.Title>
                </div>
                <Card.Text className="fw-bold" style={{ fontSize: '1.7rem', color: '#333' }}>
                  {card.value}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default DashboardContent;
