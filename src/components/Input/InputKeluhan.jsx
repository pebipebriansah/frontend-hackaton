import { useState } from 'react';
import { Button, Card, Form, Row, Col } from 'react-bootstrap';
import { Mic } from 'lucide-react';

export default function InputKeluhan({ onKirimKeluhan }) {
  const [showSuara, setShowSuara] = useState(false);
  const [showTeks, setShowTeks] = useState(false);

  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [keluhanTeks, setKeluhanTeks] = useState('');

  const toggleSuara = () => {
    setShowSuara(!showSuara);
    if (!showSuara) setShowTeks(false);
  };

  const toggleTeks = () => {
    setShowTeks(!showTeks);
    if (!showTeks) setShowSuara(false);
  };

  function startListening() {
    setListening(true);
    setRecognizedText('');
    setTimeout(() => {
      const hasilSuara = 'Daun cabai saya menguning'; // Simulasi hasil suara
      setRecognizedText(hasilSuara);
      setListening(false);
    }, 3000);
  }

  function handleKirimSuara() {
    if (!recognizedText.trim()) return alert('Belum ada teks dari suara.');
    onKirimKeluhan(recognizedText);
    setRecognizedText('');
    setShowSuara(false);
  }

  function handleKirimTeks() {
    if (!keluhanTeks.trim()) return alert('Keluhan teks kosong.');
    onKirimKeluhan(keluhanTeks);
    setKeluhanTeks('');
    setShowTeks(false);
  }

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3" style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
            Halo, Petani Cabai!
          </Card.Title>
          <Card.Text className="mb-4" style={{ fontSize: '1rem' }}>
            Kalau tanaman cabai kamu ada masalah, <br /> kamu bisa <strong>ngomong langsung</strong> atau <strong>ketik keluhanmu</strong> di sini.
          </Card.Text>
          <Row>
            <Col xs="auto" className="mb-2">
              <Button
                variant={showSuara ? 'primary' : 'outline-primary'}
                onClick={toggleSuara}
                className="d-flex align-items-center"
              >
                <Mic className="me-2" /> Bicara Sini
              </Button>
            </Col>
            <Col xs="auto" className="mb-2">
              <Button
                variant={showTeks ? 'secondary' : 'outline-secondary'}
                onClick={toggleTeks}
              >
                Tulis Keluhan
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {showSuara && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>Input Keluhan dengan Suara</Card.Header>
          <Card.Body>
            <Button
              variant={listening ? 'danger' : 'primary'}
              onClick={startListening}
              disabled={listening}
              className="w-100 mb-3"
            >
              {listening ? 'Mendengarkan...' : 'Mulai Bicara'}
            </Button>
            <div
              style={{
                backgroundColor: '#eef4f8',
                padding: '10px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                minHeight: '60px',
                color: '#2c3e50',
                whiteSpace: 'pre-wrap',
              }}
            >
              {recognizedText || '-'}
            </div>
          </Card.Body>
          <Card.Footer className="text-end">
            <Button variant="success" onClick={handleKirimSuara} disabled={!recognizedText.trim()}>
              Kirim Keluhan
            </Button>
          </Card.Footer>
        </Card>
      )}

      {showTeks && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>Input Keluhan dengan Teks</Card.Header>
          <Card.Body>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Tulis keluhanmu di sini..."
              value={keluhanTeks}
              onChange={(e) => setKeluhanTeks(e.target.value)}
            />
          </Card.Body>
          <Card.Footer className="text-end">
            <Button variant="success" onClick={handleKirimTeks} disabled={!keluhanTeks.trim()}>
              Kirim Keluhan
            </Button>
          </Card.Footer>
        </Card>
      )}
    </>
  );
}
