import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Droplet, Mic, TrendingUp, TrendingDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

function DashboardContent({ lokasi, curahHujan, loading }) {
  const idPetani = 1;

  const [hargaBulanIni] = useState(25000);
  const [hargaBulanLalu] = useState(22000);

  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [weatherRecommendation, setWeatherRecommendation] = useState('');
  const [fetchingRecommendation, setFetchingRecommendation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!window.SpeechSDK) {
      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.onload = () => console.log('Speech SDK loaded');
      script.onerror = () => setErrorMsg('Gagal memuat Speech SDK.');
      document.body.appendChild(script);
    }
  }, []);

  const getCurahHujanDesc = (value) => {
    if (value === 0) return 'tidak ada hujan';
    if (value < 2.5) return 'hujan ringan';
    if (value < 7.6) return 'hujan sedang';
    return 'hujan lebat';
  };

  const getRekomendasiCuaca = (curah) => {
    if (curah > 7) {
      return (
        'Rekomendasi Cuaca: Hujan terus-menerus lebih dari 7 hari. ' +
        'Disarankan memberikan vitamin pada tanaman agar tidak stres dan tetap sehat.'
      );
    }
    return 'Cuaca normal, tidak perlu tindakan khusus.';
  };

  const sendCuacaToBackend = async (cuacaData) => {
  setFetchingRecommendation(true);
  setErrorMsg('');
  setWeatherRecommendation('');
  try {
    const response = await fetch('https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/cuaca/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuacaData),
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    setWeatherRecommendation(data.rekomendasi || 'Tidak ada rekomendasi cuaca ditemukan.');
  } catch (error) {
    console.warn('Gagal mengambil data dari backend, gunakan fallback lokal.',error);
    // Tidak menampilkan pesan error, langsung beri fallback
    const curah = parseFloat(cuacaData.curah_hujan);
    if (curah > 7) {
      setWeatherRecommendation(
        'Hujan terus-menerus lebih dari 7 hari. Disarankan memberikan vitamin pada tanaman agar tidak stres dan tetap sehat.'
      );
    } else {
      setWeatherRecommendation(
        'Curah hujan belum melebihi 7 hari berturut-turut, kondisi cuaca masih aman.'
      );
    }
  } finally {
    setFetchingRecommendation(false);
  }
};


  useEffect(() => {
    if (loading || curahHujan == null || !lokasi) return;

    const cuacaData = {
      id_petani: idPetani,
      lokasi: lokasi.label || lokasi,
      latitude: lokasi.latitude || 0,
      longitude: lokasi.longitude || 0,
      curah_hujan: parseFloat(curahHujan),
      created_at: new Date().toISOString(),
    };

    sendCuacaToBackend(cuacaData);
  }, [curahHujan, lokasi, loading]);

  const fetchSpeechRecommendation = async (text) => {
    setFetchingRecommendation(true);
    setErrorMsg('');
    setRecommendation('');

    try {
      const response = await fetch(
        'https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/rekomendasi/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keluhan: text }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      setRecommendation(data.rekomendasi || 'Tidak ada rekomendasi ditemukan.');
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMsg('Gagal mengambil rekomendasi. Silakan coba lagi.');
    } finally {
      setFetchingRecommendation(false);
    }
  };

  const startListening = async () => {
    setListening(true);
    setRecognizedText('');
    setRecommendation('');
    setErrorMsg('');
    setFetchingRecommendation(false);

    try {
      const SpeechSDK = window.SpeechSDK;
      if (!SpeechSDK) throw new Error('Speech SDK belum tersedia.');

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
          await fetchSpeechRecommendation(result.text);
        } else {
          setRecognizedText('Gagal mengenali suara.');
        }

        recognizer.close();
      });
    } catch (err) {
      console.error('Speech recognition error:', err);
      setListening(false);
      setErrorMsg('Gagal memulai pengenalan suara. Periksa koneksi dan mikrofon Anda.');
    }
  };

  const curahHujanDisplay =
    !loading && curahHujan != null
      ? `${parseFloat(curahHujan)} mm (${getCurahHujanDesc(parseFloat(curahHujan))})`
      : 'Memuat...';

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
    <Container className="py-4">
      <h1 className="mb-5 fw-bold text-success text-center">Dashboard Petani</h1>

      {/* Kartu Info */}
      <Card className="mb-5 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
        <Row className="g-4">
          {cards.map((card, idx) => (
            <Col key={idx} md={4}>
              <Card
                className="h-100 shadow-sm"
                style={{
                  borderRadius: '18px',
                  backgroundColor: card.color,
                  cursor: 'default',
                }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div>{card.icon}</div>
                  <div>
                    <Card.Title className="fs-5 fw-semibold">{card.title}</Card.Title>
                    <Card.Text className="fs-4 fw-bold">{card.value}</Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Card Rekomendasi Cuaca */}
      <Card className="mb-5 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
        <h2 className="mb-4 fw-bold text-center">Rekomendasi Cuaca</h2>
        {fetchingRecommendation && (
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" /> Mengambil rekomendasi cuaca...
          </div>
        )}
        {weatherRecommendation && !fetchingRecommendation && (
          <Card className="p-3 mt-3 shadow-sm" style={{ borderRadius: '18px' }}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{weatherRecommendation}</ReactMarkdown>
          </Card>
        )}
      </Card>

      {/* Card Rekomendasi OpenAI */}
      <Card className="mb-5 p-4 shadow-sm" style={{ borderRadius: '18px' }}>
        <h2 className="mb-4 fw-bold text-center">Rekomendasi Tanaman (via Suara)</h2>

        <div className="text-center mb-3">
          <Button
            onClick={startListening}
            disabled={listening}
            className="btn-lg btn-success rounded-pill px-4"
            aria-label="Mulai rekam suara untuk rekomendasi"
          >
            {listening ? (
              <>
                <Spinner animation="border" size="sm" /> Mendengarkan...
              </>
            ) : (
              <>
                <Mic size={18} className="mb-1" /> Mulai Bicara
              </>
            )}
          </Button>
        </div>

        {recognizedText && (
          <Alert variant="info" className="text-center fs-6">
            <strong>Keluhan Anda:</strong> {recognizedText}
          </Alert>
        )}

        {fetchingRecommendation && (
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" /> Mengambil rekomendasi...
          </div>
        )}

        {recommendation && !fetchingRecommendation && (
          <Card className="p-3 mt-3 shadow-sm" style={{ borderRadius: '18px' }}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation}</ReactMarkdown>
          </Card>
        )}

        {errorMsg && (
          <Alert variant="danger" className="mt-3">
            {errorMsg}
          </Alert>
        )}
      </Card>
    </Container>
  );
}

export default DashboardContent;
