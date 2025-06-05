import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import fetchHargaCabai from '@/api/fetchHargaCabai';
import fetchPrediksiHarga from '@/api/fetchPrediksiHarga';
import sendCuacaToBackend from '@/api/sendCuacaToBackend';
import fetchSpeechRecommendation from '@/api/fetchSpeechRecommendation';

import HargaCabaiCard from '@/components/cards/HargaCabaiCard';
import PrediksiHargaCard from '@/components/cards/PrediksiHargaCard';
import RekomendasiCuacaCard from '@/components/cards/RekomendasiCuacaCard';
import RekomendasiSuaraCard from '@/components/cards/RekomendasiSuaraCard';

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
          <HargaCabaiCard hargaBulanIni={hargaBulanIni} hargaBulanLalu={hargaBulanLalu} />
          <PrediksiHargaCard hargaPrediksi={hargaPrediksi} meanSquaredError={meanSquaredError} />
        </Col>

        <Col md={6}>
          <RekomendasiCuacaCard loading={fetchingRecommendation} recommendation={weatherRecommendation} />
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
