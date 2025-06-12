import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import fetchHargaCabai from '../../api/fetchHargaCabai';
import fetchPrediksiHarga from '../../api/fetchPrediksiHarga';
import fetchSpeechRecommendation from '../../api/fetchSpeechRecommendation';

import HargaCabaiCard from '../../components/Cards/HargaCabaiCard';
import PrediksiHargaCard from '../../components/Cards/PrediksiHargaCard';
import InputKeluhan from '../../components/Input/InputKeluhan';
import RekomendasiSuaraModal from '../../components/Modal/RekomendasiSuaraModal';

function DashboardContent() {
  const [hargaBulanIni, setHargaBulanIni] = useState(null);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(null);
  const [hargaPrediksi, setHargaPrediksi] = useState(null);
  const [meanSquaredError, setMeanSquaredError] = useState(null);

  const [recommendation, setRecommendation] = useState('');
  const [fetchingRecommendation, setFetchingRecommendation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // === Speech Recognition ===
  const {
  transcript,
  listening,
  startListening,
  resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    fetchHargaCabai(setHargaBulanIni, setHargaBulanLalu, setErrorMsg);
    fetchPrediksiHarga(setHargaPrediksi, setMeanSquaredError, setErrorMsg);
  }, []);

  async function handleKirimKeluhan(keluhan) {
    setErrorMsg('');
    setRecommendation('');
    setFetchingRecommendation(true);

    try {
      await fetchSpeechRecommendation(keluhan, setRecommendation, setErrorMsg, setFetchingRecommendation);
    } catch (error) {
      console.error(error);
      setErrorMsg('Gagal memproses rekomendasi.');
      setFetchingRecommendation(false);
    }
  }

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <HargaCabaiCard hargaBulanIni={hargaBulanIni} hargaBulanLalu={hargaBulanLalu} />
          <PrediksiHargaCard hargaPrediksi={hargaPrediksi} meanSquaredError={meanSquaredError} />
        </Col>

        <Col md={6}>
          <InputKeluhan
            onKirimKeluhan={handleKirimKeluhan}
            transcript={transcript}
            listening={listening}
            onStartListening={startListening}
            onReset={resetTranscript}
          />
          <RekomendasiSuaraModal loading={fetchingRecommendation} recommendation={recommendation} />
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardContent;
