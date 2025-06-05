import React from 'react';
import { Card } from 'react-bootstrap';

function PreviewGambar({ imageSrc }) {
  if (!imageSrc) return null;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header>Gambar Preview</Card.Header>
      <Card.Img variant="top" src={imageSrc} style={{ maxHeight: '300px', objectFit: 'cover' }} />
    </Card>
  );
}

export default PreviewGambar;