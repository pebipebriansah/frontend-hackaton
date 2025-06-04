import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Droplet, Mic, TrendingUp, TrendingDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import useSpeechRecognition from './hooks/useSpeechRecognition';
import fetchHargaCabai from './utils/fetchHargaCabai';
import fetchPrediksiHarga from './utils/fetchPrediksiHarga';
import sendCuacaToBackend from './utils/sendCuacaToBackend';
import fetchSpeechRecommendation from './utils/fetchSpeechRecommendation';

function DashboardContent({ lokasi, curahHujan, loading }) {
  const idPetani = localStorage.getItem('id_petani');

  const [hargaBulanIni, setHargaBulanIni] = useState(null);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(null);
  const [hargaPrediksi, setHargaPrediksi] = useState(null);
  const [meanSquaredError, setMeanSquaredError] = useState(null);

  const [recommendation, setRecommendation] = useState('');
  const [weatherRecommendation, setWeatherRecommendation] = useState('');
  const [fetchingRecommendation, setFetchingRecommendation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    listening,
    recognizedText,
    startListening,
  } = useSpeechRecognition({
    onResult: async (text) => {
      setRecommendation('');
      await fetchSpeechRecommendation(text, setRecommendation, setErrorMsg, setFetchingRecommendation);
    },
    onError: (msg) => setErrorMsg(msg)
  });

  useEffect(() => {
    fetchHargaCabai(setHargaBulanIni, setHargaBulanLalu, setErrorMsg);
    fetchPrediksiHarga(setHargaPrediksi, setMeanSquaredError, setErrorMsg);
  }, []);

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

    sendCuacaToBackend(cuacaData, setWeatherRecommendation, setErrorMsg, setFetchingRecommendation);
  }, [curahHujan, lokasi, loading, idPetani]);

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Harga Cabai</Card.Title>
              <p>Bulan lalu: Rp {hargaBulanLalu ?? '-'} / kg</p>
              <p>Bulan ini: Rp {hargaBulanIni ?? '-'} / kg</p>
              <p>
                {hargaBulanIni && hargaBulanLalu && (
                  hargaBulanIni > hargaBulanLalu ? (
                    <span className="text-success"><TrendingUp /> Naik</span>
                  ) : hargaBulanIni < hargaBulanLalu ? (
                    <span className="text-danger"><TrendingDown /> Turun</span>
                  ) : (
                    <span className="text-muted">Stabil</span>
                  )
                )}
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Prediksi Harga Cabai</Card.Title>
              {hargaPrediksi !== null ? (
                <>
                  <p>Prediksi harga bulan depan: Rp {hargaPrediksi}</p>
                  <p>Mean Squared Error: {meanSquaredError}</p>
                </>
              ) : <Spinner animation="border" size="sm" />}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title><Droplet /> Rekomendasi Cuaca</Card.Title>
              {fetchingRecommendation ? <Spinner animation="border" size="sm" /> : (
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{weatherRecommendation}</ReactMarkdown>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title><Mic /> Rekomendasi dari Suara</Card.Title>
              <Button variant={listening ? 'danger' : 'primary'} onClick={startListening} disabled={fetchingRecommendation}>
                {listening ? 'Mendengarkan...' : 'Mulai Bicara'}
              </Button>
              <p className="mt-2">Teks: {recognizedText}</p>
              <div className="mt-2">
                {fetchingRecommendation ? <Spinner animation="border" size="sm" /> : (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation}</ReactMarkdown>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default DashboardContent;
