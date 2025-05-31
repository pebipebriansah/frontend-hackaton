import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Droplet, Mic, TrendingUp, TrendingDown } from 'lucide-react';

function DashboardContent({ lokasi, curahHujan, loading }) {
  const [hargaBulanIni, setHargaBulanIni] = useState(25000);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(22000);
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    if (window.SpeechSDK === undefined) {
      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.onload = () => console.log('Speech SDK loaded');
      document.body.appendChild(script);
    }
  }, []);

  const startListening = async () => {
  setListening(true);
  setRecognizedText('');
  setRecommendation('');

  const SpeechSDK = window.SpeechSDK;
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    '2NJiSLaOf1eIrxW3bQrR7jT8DFvFr1cxt7us0ArGY00HL6cbBn8uJQQJ99BEAC3pKaRXJ3w3AAAYACOG1yNZ', // Ganti dengan kunci Azure Speech Anda
    'eastasia'      // Ganti dengan region Azure Anda, contoh: 'eastasia'
  );
  speechConfig.speechRecognitionLanguage = 'id-ID';
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  recognizer.recognizeOnceAsync(async (result) => {
    setListening(false);
    if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      setRecognizedText(result.text);

      const res = await fetch('https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/rekomendasi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // hapus Authorization
        },
        body: JSON.stringify({ keluhan: result.text })
      });

      const data = await res.json();
      setRecommendation(data.rekomendasi || 'Tidak ada rekomendasi ditemukan.');
    } else {
      setRecognizedText('Gagal mengenali suara.');
    }
    recognizer.close();
  });
};


  const getCurahHujanDesc = (value) => {
    if (value === 0) return 'tidak ada hujan';
    if (value < 2.5) return 'hujan ringan';
    if (value < 7.6) return 'hujan sedang';
    return 'hujan lebat';
  };

  let curahHujanDisplay = 'Memuat...';
  if (!loading && curahHujan !== null) {
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

      <Card className="p-4" style={{ borderRadius: '18px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
        <h4 className="mb-3">Input Suara Keluhan Petani</h4>
        <Button variant="primary" onClick={startListening} disabled={listening}>
          <Mic className="me-2" size={20} />
          {listening ? 'Mendengarkan...' : 'Mulai Bicara'}
        </Button>
        {recognizedText && (
          <Alert variant="info" className="mt-3">
            <strong>Hasil Pengenalan Suara:</strong> {recognizedText}
          </Alert>
        )}
        {recommendation && (
          <Alert variant="success" className="mt-2">
            <strong>Rekomendasi:</strong> {recommendation}
          </Alert>
        )}
      </Card>
    </>
  );
}

export default DashboardContent;
