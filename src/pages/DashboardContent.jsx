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

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setImagePreview(canvas.toDataURL('image/jpeg'));
    }
  };

  const detectDisease = async () => {
    if (!imagePreview) {
      setErrorMsg('Silakan ambil atau unggah gambar terlebih dahulu');
      return;
    }

    setIsDetecting(true);
    setDetectionResult(null);
    setErrorMsg('');

    try {
      // Convert base64 to blob
      const blob = await fetch(imagePreview).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'chili-image.jpg');
      formData.append('id_petani', idPetani);

      const response = await fetch(
        'https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/deteksi/predict',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Gagal melakukan deteksi penyakit');

      const data = await response.json();
      setDetectionResult(data);
    } catch (error) {
      console.error('Detection error:', error);
      setErrorMsg('Gagal melakukan deteksi. Silakan coba lagi.');
      
      // Fallback mock data for demo purposes
      setDetectionResult({
        penyakit: "Antraknosa",
        akurasi: "85%",
        deskripsi: "Penyakit antraknosa disebabkan oleh jamur Colletotrichum spp. yang menyerang buah cabai.",
        solusi: "1. Buang bagian tanaman yang terinfeksi\n2. Gunakan fungisida yang mengandung bahan aktif azoxystrobin\n3. Tingkatkan sirkulasi udara di sekitar tanaman\n4. Hindari penyiraman dari atas tanaman"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const resetDetection = () => {
    setImagePreview(null);
    setDetectionResult(null);
    setErrorMsg('');
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
  {/* Judul yang Dipercantik */}
  <div className="text-center mb-5 position-relative">
    <div className="px-4 py-3 d-inline-block" style={{
      backgroundColor: '#f8fff8',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)',
      border: '1px solid #e8f5e9'
    }}>
      <h1 className="mb-1" style={{ 
        color: '#2E7D32',
        fontWeight: '700',
        fontSize: '2.2rem',
        letterSpacing: '0.5px',
        position: 'relative'
      }}>
        <span style={{
          position: 'absolute',
          left: '-30px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1.8rem'
        }}>🌾</span>
        Dashboard Petani Modern
        <span style={{
          position: 'absolute',
          right: '-30px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1.8rem'
        }}>🌾</span>
      </h1>
      <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
        Informasi real-time untuk pertanian cerdas
      </p>
    </div>
  </div>

  {/* Kartu Info - Dipercantik */}
  <Row className="g-4 mb-5">
    {cards.map((card, idx) => (
      <Col key={idx} xs={12} sm={6} lg={3}>
        <Card
          className="h-100 border-0 position-relative overflow-hidden"
          style={{
            borderRadius: '14px',
            backgroundColor: card.color,
            boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)';
          }}
        >
          {/* Efek gradasi */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${card.color} 0%, rgba(255,255,255,0.3) 100%)`,
            zIndex: -1
          }}></div>
          
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 me-3 rounded-circle" style={{ 
                backgroundColor: 'rgba(255,255,255,0.4)',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {card.icon}
              </div>
              <Card.Title className="mb-0" style={{ 
                fontSize: '1.15rem',
                fontWeight: '600',
                color: '#333'
              }}>
                {card.title}
              </Card.Title>
            </div>
            <div style={{ minHeight: '90px' }}>
              <div className="fw-bold mb-2" style={{ 
                fontSize: '1.4rem',
                color: '#2E7D32',
                lineHeight: '1.3'
              }}>
                {card.value}
              </div>
              <div className="text-muted small" style={{ lineHeight: '1.4' }}>
                {card.desc}
              </div>
            </div>
          </Card.Body>
          
          {/* Garis aksen */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: idx === 0 ? '#2196F3' : 
                          idx === 1 ? '#4CAF50' : 
                          idx === 2 ? '#F44336' : '#FF9800',
            transition: 'all 0.3s ease'
          }}></div>
        </Card>
      </Col>
    ))}
  </Row>

<Card className="mb-5 border-0" style={{
        borderRadius: '14px',
        boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <Card.Body className="p-0">
          <div className="p-4" style={{ 
            backgroundColor: '#FFF3E0',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h2 className="mb-0 d-flex align-items-center" style={{ 
              color: '#E65100',
              fontWeight: '600',
              fontSize: '1.5rem'
            }}>
              <Camera className="me-3" size={28} style={{ 
                backgroundColor: '#FF9800',
                color: 'white',
                padding: '6px',
                borderRadius: '50%'
              }} />
              Deteksi Penyakit Cabai
            </h2>
          </div>
          
          <div className="p-4">
            {!imagePreview ? (
              <div className="text-center">
                <div className="d-flex justify-content-center gap-3 mb-4">
                  <Button 
                    variant="warning" 
                    className="rounded-pill px-4 py-3 d-flex align-items-center"
                    onClick={() => setShowCameraModal(true)}
                    style={{ fontWeight: '600' }}
                  >
                    <Camera size={18} className="me-2" />
                    Ambil Foto
                  </Button>
                  <span className="align-self-center">atau</span>
                  <Button 
                    variant="outline-secondary" 
                    className="rounded-pill px-4 py-3 d-flex align-items-center"
                    onClick={() => fileInputRef.current.click()}
                    style={{ fontWeight: '600' }}
                  >
                    <Image size={18} className="me-2" />
                    Unggah Gambar
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <p className="text-muted">
                  Ambil foto daun atau buah cabai yang diduga terkena penyakit untuk mendapatkan diagnosis
                </p>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        borderRadius: '10px',
                        border: '2px solid #FF9800'
                      }} 
                    />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="position-absolute top-0 end-0 m-2 rounded-circle"
                      onClick={resetDetection}
                      style={{ width: '30px', height: '30px' }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="warning" 
                    className="rounded-pill px-5 py-3 mb-3"
                    onClick={detectDisease}
                    disabled={isDetecting}
                    style={{ fontWeight: '600' }}
                  >
                    {isDetecting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        Deteksi Penyakit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {isDetecting && (
              <div className="text-center py-4">
                <Spinner animation="border" variant="warning" className="me-2" />
                <span style={{ color: '#FF9800', fontWeight: '500' }}>
                  Menganalisis gambar...
                </span>
              </div>
            )}

            {detectionResult && (
              <div className="mt-4 p-4 rounded" style={{ 
                backgroundColor: '#FFF8E1',
                borderLeft: '4px solid #FF9800'
              }}>
                <h5 className="mb-3" style={{ color: '#E65100' }}>
                  Hasil Deteksi
                </h5>
                <div className="mb-3">
                  <strong>Penyakit: </strong>
                  <span className="badge bg-warning text-dark">
                    {detectionResult.penyakit}
                  </span>
                  {detectionResult.akurasi && (
                    <span className="ms-2 badge bg-light text-dark">
                      Akurasi: {detectionResult.akurasi}
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  <strong>Deskripsi: </strong>
                  <p>{detectionResult.deskripsi}</p>
                </div>
                <div>
                  <strong>Solusi: </strong>
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {detectionResult.solusi}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {errorMsg && (
              <Alert variant="danger" className="mt-3">
                {errorMsg}
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>
  {/* Rekomendasi Cuaca - Dipercantik */}
  <Card className="mb-5 border-0" style={{
    borderRadius: '14px',
    boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  }}>
    <Card.Body className="p-0">
      <div className="p-4" style={{ 
        backgroundColor: '#E3F2FD',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <h2 className="mb-0 d-flex align-items-center" style={{ 
          color: '#0D47A1',
          fontWeight: '600',
          fontSize: '1.5rem'
        }}>
          <Droplet className="me-3" size={28} style={{ 
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '6px',
            borderRadius: '50%'
          }} />
          Rekomendasi Cuaca
        </h2>
      </div>
      
      <div className="p-4">
        {fetchingRecommendation ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" className="me-2" />
            <span style={{ color: '#1565C0', fontWeight: '500' }}>
              Memuat rekomendasi cuaca...
            </span>
          </div>
        ) : (
          weatherRecommendation && (
            <div className="p-4 rounded" style={{ 
              backgroundColor: '#F5FBFF',
              borderLeft: '4px solid #2196F3',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{weatherRecommendation}</ReactMarkdown>
            </div>
          )
        )}
      </div>
    </Card.Body>
  </Card>

  {/* Rekomendasi Suara - Dipercantik */}
  <Card className="mb-4 border-0" style={{
    borderRadius: '14px',
    boxShadow: '0 6px 15px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  }}>
    <Card.Body className="p-0">
      <div className="p-4" style={{ 
        backgroundColor: '#E8F5E9',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <h2 className="mb-0 d-flex align-items-center" style={{ 
          color: '#1B5E20',
          fontWeight: '600',
          fontSize: '1.5rem'
        }}>
          <Mic className="me-3" size={28} style={{ 
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '6px',
            borderRadius: '50%'
          }} />
          Konsultasi Petani (Via Suara)
        </h2>
      </div>
      
      <div className="p-4">
        <div className="text-center mb-4">
          <Button
            onClick={startListening}
            disabled={listening}
            className="rounded-pill px-5 py-3"
            style={{
              backgroundColor: '#388E3C',
              border: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              boxShadow: '0 4px 8px rgba(56, 142, 60, 0.3)',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(56, 142, 60, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(56, 142, 60, 0.3)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {listening ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                <span style={{ position: 'relative', zIndex: 1 }}>Mendengarkan...</span>
              </>
            ) : (
              <>
                <Mic size={20} className="me-2" style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Tekan untuk Bicara</span>
              </>
            )}
            <span style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0))',
              transform: 'rotate(30deg)',
              transition: 'all 0.3s',
              opacity: 0
            }} className="hover-shine"></span>
          </Button>
          <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.95rem' }}>
            Ceritakan keluhan Anda tentang tanaman, kami akan berikan solusi terbaik
          </p>
        </div>

        {recognizedText && (
          <Alert variant="light" className="mb-4" style={{ 
            borderLeft: '4px solid #4CAF50',
            backgroundColor: '#f8fff8'
          }}>
            <strong style={{ color: '#2E7D32' }}>Anda berkata:</strong> 
            <div className="mt-2" style={{ color: '#333' }}>{recognizedText}</div>
          </Alert>
        )}

        {fetchingRecommendation && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" className="me-2" />
            <span style={{ color: '#388E3C', fontWeight: '500' }}>
              Mencari solusi untuk masalah Anda...
            </span>
          </div>
        )}

        {recommendation && !fetchingRecommendation && (
          <div className="p-4 rounded" style={{ 
            backgroundColor: '#f8fff8',
            borderLeft: '4px solid #4CAF50',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h5 className="mb-3" style={{ 
              color: '#2E7D32',
              fontWeight: '600',
              fontSize: '1.2rem'
            }}>Rekomendasi:</h5>
            <div style={{ lineHeight: '1.6' }}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation}</ReactMarkdown>
            </div>
          </div>
        )}

        {errorMsg && (
          <Alert variant="danger" className="mt-4" style={{ 
            borderLeft: '4px solid #f44336',
            backgroundColor: '#ffebee'
          }}>
            {errorMsg}
          </Alert>
        )}
      </div>
    </Card.Body>
  </Card>
  {/* Camera Modal */}
      <Modal show={showCameraModal} onHide={() => {
        setShowCameraModal(false);
        stopCamera();
      }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Ambil Foto</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {cameraError ? (
            <Alert variant="danger">{cameraError}</Alert>
          ) : (
            <div style={{ position: 'relative' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ 
                  width: '100%', 
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px'
                }}
              />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Captured" 
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    width: '120px', 
                    border: '2px solid white',
                    borderRadius: '4px'
                  }} 
                />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {!imagePreview ? (
            <Button 
              variant="primary" 
              onClick={captureImage}
              disabled={cameraError}
            >
              Ambil Foto
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setImagePreview(null);
                  startCamera();
                }}
              >
                Ambil Ulang
              </Button>
              <Button 
                variant="success" 
                onClick={() => {
                  setShowCameraModal(false);
                  stopCamera();
                }}
              >
                Gunakan Foto Ini
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
</Container>
  );
}

export default DashboardContent;