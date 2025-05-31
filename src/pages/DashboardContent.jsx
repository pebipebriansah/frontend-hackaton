import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Droplet, Mic, TrendingUp, TrendingDown } from 'lucide-react';

function DashboardContent({ lokasi, curahHujan, loading }) {
  const [hargaBulanIni, setHargaBulanIni] = useState(25000);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(22000);
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [fetchingRecommendation, setFetchingRecommendation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');
    setFetchingRecommendation(false);

    try {
      const SpeechSDK = window.SpeechSDK;
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        '2NJiSLaOf1eIrxW3bQrR7jT8DFvFr1cxt7us0ArGY00HL6cbBn8uJQQJ99BEAC3pKaRXJ3w3AAAYACOG1yNZ',
        'eastasia'
      );
      speechConfig.speechRecognitionLanguage = 'id-ID';
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(async (result) => {
        setListening(false);
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setRecognizedText(result.text);
          setFetchingRecommendation(true);

          try {
            const res = await fetch('https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/rekomendasi/rekomendasi/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keluhan: result.text }),
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setRecommendation(data.rekomendasi || 'Tidak ada rekomendasi ditemukan.');
          } catch (fetchError) {
            setRecommendation('');
            setErrorMsg('Gagal mengambil rekomendasi. Silakan coba lagi.');
          } finally {
            setFetchingRecommendation(false);
          }
        } else {
          setRecognizedText('Gagal mengenali suara.');
        }
        recognizer.close();
      });
    } catch (e) {
      setListening(false);
      setErrorMsg('Error saat memulai pengenalan suara. Pastikan mikrofon berfungsi.');
    }
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
      <h1 className="mb-4 fw-bold text-success text-center">Dashboard Petani</h1>
      <Row className="g-4 mb-4">
        {cards.map((card, idx) => (
          <Col key={idx} md={4}>
            <Card
              className="h-100 shadow-sm"
              style={{
                borderRadius: '18px',
                backgroundColor: card.color,
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                  {card.icon}
                  <Card.Title className="fw-semibold m-0" style={{ fontSize: '1.3rem' }}>
                    {card.title}
                  </Card.Title>
                </div>
                <Card.Text className="fw-bold" style={{ fontSize: '1.9rem', color: '#333' }}>
                  {card.value}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="p-4 mx-auto"
        style={{
          maxWidth: '600px',
          borderRadius: '18px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          backgroundColor: '#fefefe',
        }}
      >
        <h4 className="mb-4 fw-semibold text-center text-primary">Input Suara Keluhan Petani</h4>

        <div className="d-flex justify-content-center mb-3">
          <Button
            variant={listening ? 'danger' : 'primary'}
            onClick={startListening}
            disabled={listening || fetchingRecommendation}
            style={{ minWidth: '160px', fontWeight: '600', fontSize: '1.1rem' }}
          >
            <Mic className="me-2" size={22} />
            {listening ? 'Mendengarkan...' : fetchingRecommendation ? 'Memproses...' : 'Mulai Bicara'}
          </Button>
        </div>

        {/* Hasil Pengenalan Suara */}
        {recognizedText && (
          <Alert
            variant={recognizedText.startsWith('Gagal') ? 'danger' : 'info'}
            className="mb-3"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '1rem',
              lineHeight: '1.4',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <strong>Hasil Pengenalan Suara:</strong> <br />
            {recognizedText}
          </Alert>
        )}

        {/* Loading Spinner */}
        {fetchingRecommendation && (
          <div className="text-center mb-3">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2" style={{ fontWeight: '600', color: '#0d6efd' }}>
              Mengambil rekomendasi...
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <Alert variant="danger" className="mb-3">
            {errorMsg}
          </Alert>
        )}

        {/* Rekomendasi */}
        {recommendation && !fetchingRecommendation && (
          <Alert
            variant="success"
            className="mb-0"
            style={{
              whiteSpace: 'pre-wrap',
              maxHeight: '180px',
              overflowY: 'auto',
              wordBreak: 'break-word',
              fontSize: '1rem',
              lineHeight: '1.4',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              backgroundColor: '#d4edda',
              color: '#155724',
            }}
          >
            <strong>Rekomendasi:</strong> <br />
            {recommendation}
          </Alert>
        )}
      </Card>
    </>
  );
}

export default DashboardContent;
