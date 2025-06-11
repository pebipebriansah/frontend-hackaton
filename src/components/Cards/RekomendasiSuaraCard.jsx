import { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Mic } from 'lucide-react';

export default function InputKeluhanButtons({ onKirimKeluhan }) {
  const [showModalSuara, setShowModalSuara] = useState(false);
  const [showModalTeks, setShowModalTeks] = useState(false);

  // State untuk suara
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  // State untuk teks
  const [keluhanTeks, setKeluhanTeks] = useState('');

  // Simulasi fungsi rekam suara
  function startListening() {
    setListening(true);
    setRecognizedText('');
    setTimeout(() => {
      const hasilSuara = 'Daun cabai saya menguning'; // Contoh
      setRecognizedText(hasilSuara);
      setListening(false);
    }, 3000);
  }

  function handleKirimSuara() {
    if (!recognizedText.trim()) return alert('Belum ada teks dari suara.');
    onKirimKeluhan(recognizedText);
    setShowModalSuara(false);
    setRecognizedText('');
  }

  function handleKirimTeks() {
    if (!keluhanTeks.trim()) return alert('Keluhan teks kosong.');
    onKirimKeluhan(keluhanTeks);
    setShowModalTeks(false);
    setKeluhanTeks('');
  }

  return (
    <>
      <Button variant="primary" onClick={() => setShowModalSuara(true)} className="me-2">
        <Mic /> Input Suara
      </Button>
      <Button variant="secondary" onClick={() => setShowModalTeks(true)}>
        Ketik Keluhan
      </Button>

      {/* Modal Input Suara */}
      <Modal show={showModalSuara} onHide={() => setShowModalSuara(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Input Keluhan dengan Suara</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleKirimSuara} disabled={!recognizedText.trim()}>
            Kirim Keluhan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Input Teks */}
      <Modal show={showModalTeks} onHide={() => setShowModalTeks(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Input Keluhan dengan Teks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Ketikan keluhan Anda di sini..."
            value={keluhanTeks}
            onChange={e => setKeluhanTeks(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleKirimTeks} disabled={!keluhanTeks.trim()}>
            Kirim Keluhan
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
