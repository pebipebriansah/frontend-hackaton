import { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import ReactMarkdown from "react-markdown";

export default function RekomendasiSuaraModal({ loading, recommendation }) {
  const [show, setShow] = useState(false);
  const [cleanedRecommendation, setCleanedRecommendation] = useState('');

  useEffect(() => {
    // Buka modal otomatis jika ada rekomendasi baru
    if (recommendation && !loading) {
      setShow(true);

      // Bersihkan spasi berlebihan
      const cleaned = recommendation.replace(/\n{3,}/g, '\n\n');
      setCleanedRecommendation(cleaned);
    }
  }, [recommendation, loading]);

  return (
    <>
      <Button
        variant="info"
        className="w-100 mb-3"
        onClick={() => setShow(true)}
        disabled={!recommendation || loading}
      >
        {loading ? 'Memproses Rekomendasi...' : 'Lihat Rekomendasi AI'}
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Rekomendasi Dari AI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status" />
              <div className="mt-2">Memproses rekomendasi...</div>
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <ReactMarkdown>{cleanedRecommendation || 'Belum ada rekomendasi.'}</ReactMarkdown>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
