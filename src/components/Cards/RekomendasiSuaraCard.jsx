import { Card, Spinner } from 'react-bootstrap';

export default function RekomendasiSuaraCard({ loading, recommendation }) {
  return (
    <Card className="shadow-sm">
      <Card.Header>Rekomendasi Dari AI</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" />
            <div>Memproses rekomendasi...</div>
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
            {recommendation || 'Belum ada rekomendasi.'}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
