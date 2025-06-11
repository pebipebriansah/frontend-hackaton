import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import fetchHargaCabai from '@/api/fetchHargaCabai';
import fetchPrediksiHarga from '@/api/fetchPrediksiHarga';
import fetchSpeechRecommendation from '@/api/fetchSpeechRecommendation';

import HargaCabaiCard from '@/components/cards/HargaCabaiCard';
import PrediksiHargaCard from '@/components/cards/PrediksiHargaCard';
import RekomendasiSuaraCard from '@/components/cards/RekomendasiSuaraCard';

function DashboardContent() {
  const [hargaBulanIni, setHargaBulanIni] = useState(null);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(null);
  const [hargaPrediksi, setHargaPrediksi] = useState(null);
  const [meanSquaredError, setMeanSquaredError] = useState(null);

  const [recommendation, setRecommendation] = useState('');
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

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <HargaCabaiCard hargaBulanIni={hargaBulanIni} hargaBulanLalu={hargaBulanLalu} />
          <PrediksiHargaCard hargaPrediksi={hargaPrediksi} meanSquaredError={meanSquaredError} />
        </Col>

        <Col md={6}>
          <RekomendasiSuaraCard
            loading={fetchingRecommendation}
            recommendation={recommendation}
            listening={listening}
            recognizedText={recognizedText}
            onStartListening={startListening}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardContent;
