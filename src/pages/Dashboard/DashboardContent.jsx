import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';

import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import fetchHargaCabai from '../../api/fetchHargaCabai';
// import fetchPrediksiHarga from '../../api/fetchPrediksiHarga'; // tidak dipakai lagi
import fetchSpeechRecommendation from '../../api/fetchSpeechRecommendation';

import HargaCabaiCard from '../../components/Cards/HargaCabaiCard';
// import PrediksiHargaCard from '../../components/Cards/PrediksiHargaCard'; // tidak dipakai lagi
import InputKeluhan from '../../components/Input/InputKeluhan';
import RekomendasiSuaraModal from '../../components/Modal/RekomendasiSuaraModal';

function DashboardContent() {
  const [hargaBulanIni, setHargaBulanIni] = useState(null);
  const [hargaBulanLalu, setHargaBulanLalu] = useState(null);

  const [recommendation, setRecommendation] = useState('');
  const [fetchingRecommendation, setFetchingRecommendation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [keluhan, setKeluhan] = useState('');

  const {
    startListening,
    listening,
  } = useSpeechRecognition({
    onResult: (text) => setKeluhan(text),
    onError: (err) => setErrorMsg(err),
  });

  useEffect(() => {
    fetchHargaCabai(setHargaBulanIni, setHargaBulanLalu, setErrorMsg);
    // fetchPrediksiHarga(...) dihapus
  }, []);

  async function handleKirimKeluhan(keluhanInput) {
    setErrorMsg('');
    setRecommendation('');
    setFetchingRecommendation(true);

    try {
      await fetchSpeechRecommendation(
        keluhanInput,
        setRecommendation,
        setErrorMsg,
        setFetchingRecommendation
      );
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
          {/* PrediksiHargaCard dihapus */}
        </Col>

        <Col md={6}>
          <InputKeluhan
            onKirimKeluhan={() => handleKirimKeluhan(keluhan)}
            keluhan={keluhan}
            setKeluhan={setKeluhan}
            startListening={startListening}
            listening={listening}
          />
          <RekomendasiSuaraModal loading={fetchingRecommendation} recommendation={recommendation} />
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardContent;
