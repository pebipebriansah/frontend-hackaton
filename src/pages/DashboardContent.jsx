import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Droplet, Mic, TrendingUp, TrendingDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

function DashboardContent({ lokasi, curahHujan, loading }) {
  const idPetani = localStorage.getItem('id_petani');

  const [hargaBulanIni, setHargaBulanIni] = useState(null);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(null);
  const [hargaPrediksi, setHargaPrediksi] = useState(null);
  const [meanSquaredError, setMeanSquaredError] = useState(null);

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
    
    const fetchHargaCabai = async () => {
      try {
        const response = await fetch(
          'https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/harga/harga/'
        );

        if (!response.ok) {
          throw new Error('Gagal mengambil data harga dari server.');
        }

        const data = await response.json();
        setHargaBulanIni(data.harga_bulan_ini);
        setHargaBulanLalu(data.harga_bulan_lalu);
      } catch (error) {
        console.error('Error saat fetch harga cabai:', error);
      }
    };
    fetchHargaCabai();

    const fetchPrediksiHarga = async () => {
      try {
        const response = await fetch(
          'https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/harga/harga/prediksi'
        );
        if (!response.ok) throw new Error('Gagal mengambil data prediksi harga.');

        const data = await response.json();
        setHargaPrediksi(data.harga_bulan_depan);
        setMeanSquaredError(data.mean_squared_error);
      } catch (error) {
        console.error('Error saat fetch prediksi harga:', error);
      }
    };

    fetchPrediksiHarga();
  }, []);

  const getCurahHujanDesc = (value) => {
    if (value === 0) return 'Tidak ada hujan';
    if (value < 2.5) return 'Hujan ringan';
    if (value < 7.6) return 'Hujan sedang';
    return 'Hujan lebat';
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
      console.warn('Gagal mengambil data dari backend, gunakan fallback lokal.', error);
      const curah = parseFloat(cuacaData.curah_hujan);
      if (curah > 7) {
        setWeatherRecommendation(
          '**Hujan terus-menerus lebih dari 7 hari.**\n\nDisarankan:\n- Berikan vitamin pada tanaman agar tidak stres\n- Periksa saluran drainase\n- Waspada terhadap serangan penyakit'
        );
      } else {
        setWeatherRecommendation('**Kondisi cuaca normal**\n\nCurah hujan belum melebihi 7 hari berturut-turut, kondisi tanaman masih aman.');
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
          setRecognizedText('Gagal mengenali suara. Silakan coba lagi.');
        }

        recognizer.close();
      });
    } catch (err) {
      console.error('Speech recognition error:', err);
      setListening(false);
      setErrorMsg('Gagal memulai pengenalan suara. Periksa koneksi dan mikrofon Anda.');
    }
  };

  const cards = [
    {
      title: `Curah Hujan (${lokasi?.label || 'Lokasi'})`,
      value: !loading && curahHujan != null
        ? `${parseFloat(curahHujan)} mm\n(${getCurahHujanDesc(parseFloat(curahHujan))})`
        : 'Memuat...',
      icon: <Droplet size={36} className="text-primary" />,
      color: '#E3F2FD',
      desc: 'Informasi curah hujan terkini di lokasi Anda'
    },
    {
      title: 'Harga Bulan Ini',
      value: hargaBulanIni !== null
        ? hargaBulanIni.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
        : 'Memuat...',
      icon: <TrendingUp size={36} className="text-success" />,
      color: '#E8F5E9',
      desc: 'Harga rata-rata cabai bulan ini'
    },
    {
      title: 'Harga Bulan Lalu',
      value: hargaBulanLalu !== null
        ? hargaBulanLalu.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
        : 'Memuat...',
      icon: <TrendingDown size={36} className="text-danger" />,
      color: '#FFEBEE',
      desc: 'Harga rata-rata cabai bulan lalu'
    },
    {
      title: 'Prediksi Harga',
      value: hargaPrediksi !== null
        ? (
          <>
            {hargaPrediksi.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })} 
            <div className="mt-2 text-muted small">
              Akurasi prediksi: {meanSquaredError?.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
            </div>
          </>
        )
        : 'Memuat...',
      icon: <TrendingUp size={36} className="text-warning" />,
      color: '#FFF3E0',
      desc: 'Perkiraan harga bulan depan berdasarkan data terkini'
    },
  ];

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <h1 className="mb-4 text-center" style={{ 
        color: '#2E7D32',
        fontWeight: 'bold',
        fontSize: '2rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
      }}>
        Dashboard Informasi Petani
      </h1>

      {/* Kartu Info */}
      <Row className="g-3 mb-4">
        {cards.map((card, idx) => (
          <Col key={idx} xs={12} sm={6} lg={3}>
            <Card
              className="h-100 border-0"
              style={{
                borderRadius: '12px',
                backgroundColor: card.color,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <Card.Body className="py-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="me-3">{card.icon}</div>
                  <Card.Title className="mb-0" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    {card.title}
                  </Card.Title>
                </div>
                <div style={{ minHeight: '80px' }}>
                  <div className="fw-bold" style={{ fontSize: '1.3rem' }}>
                    {card.value}
                  </div>
                  <div className="text-muted small mt-1">{card.desc}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Rekomendasi Cuaca */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <h2 className="mb-3" style={{ 
            color: '#1565C0',
            fontWeight: '600',
            fontSize: '1.5rem'
          }}>
            <Droplet className="me-2" size={24} />
            Rekomendasi Cuaca
          </h2>
          
          {fetchingRecommendation ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" size="sm" className="me-2" />
              Memuat rekomendasi cuaca...
            </div>
          ) : (
            weatherRecommendation && (
              <div className="p-3 mt-2 rounded" style={{ 
                backgroundColor: '#F5FBFF',
                borderLeft: '4px solid #2196F3'
              }}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{weatherRecommendation}</ReactMarkdown>
              </div>
            )
          )}
        </Card.Body>
      </Card>

      {/* Rekomendasi Suara */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <h2 className="mb-3" style={{ 
            color: '#388E3C',
            fontWeight: '600',
            fontSize: '1.5rem'
          }}>
            <Mic className="me-2" size={24} />
            Konsultasi Petani (Via Suara)
          </h2>
          
          <div className="text-center mb-3">
            <Button
              onClick={startListening}
              disabled={listening}
              className="rounded-pill px-4 py-2"
              style={{
                backgroundColor: '#388E3C',
                border: 'none',
                fontWeight: '500',
                fontSize: '1.1rem'
              }}
            >
              {listening ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> Mendengarkan...
                </>
              ) : (
                <>
                  <Mic size={20} className="me-2" />
                  Tekan untuk Bicara
                </>
              )}
            </Button>
            <p className="text-muted small mt-2">
              Ceritakan keluhan Anda tentang tanaman, kami akan berikan solusi
            </p>
          </div>

          {recognizedText && (
            <Alert variant="light" className="mb-3" style={{ borderLeft: '4px solid #4CAF50' }}>
              <strong>Anda berkata:</strong> {recognizedText}
            </Alert>
          )}

          {fetchingRecommendation && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="success" size="sm" className="me-2" />
              Mencari solusi untuk masalah Anda...
            </div>
          )}

          {recommendation && !fetchingRecommendation && (
            <div className="p-3 mt-2 rounded" style={{ 
              backgroundColor: '#E8F5E9',
              borderLeft: '4px solid #4CAF50'
            }}>
              <h5 className="mb-2" style={{ color: '#2E7D32' }}>Rekomendasi:</h5>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation}</ReactMarkdown>
            </div>
          )}

          {errorMsg && (
            <Alert variant="danger" className="mt-3">
              {errorMsg}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DashboardContent;