import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

function HasilDeteksi({ result }) {
  if (!result?.data) return null;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header>Hasil Deteksi</Card.Header>
      <Card.Body>
        <Card.Text style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
          <span>Label Prediksi: </span>
          <span style={{ color: '#2c3e50' }}>{result.data.label}</span>
        </Card.Text>

        <pre>{JSON.stringify(result.data.confidences, null, 2)}</pre>

        {result.data.confidences && result.data.confidences.length > 0 ? (
          result.data.confidences.map(({ label, confidence }) => {
            const percent = confidence * 100;
            let variant = 'danger';
            if (percent > 75) variant = 'success';
            else if (percent > 40) variant = 'warning';

            return (
              <div key={label} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    color: '#34495e',
                  }}
                >
                  <span>{label}</span>
                </div>
                <ProgressBar
                  now={percent}
                  variant={variant}
                  style={{ height: '1.5rem', borderRadius: '0.5rem' }}
                  animated
                />
              </div>
            );
          })
        ) : (
          <p>Data confidence tidak tersedia.</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default HasilDeteksi;