import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

export default function PriceRange({ hargaBulanIni }) {
  const [minHarga, setMinHarga] = useState('');
  const [maxHarga, setMaxHarga] = useState('');
  const [pesanRekomendasi, setPesanRekomendasi] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const min = Number(minHarga);
    const max = Number(maxHarga);

    if (isNaN(min) || isNaN(max) || min > max) {
      setPesanRekomendasi('Rentang harga tidak valid. Pastikan angka dan min <= max.');
      return;
    }

    if (hargaBulanIni >= max || hargaBulanIni <= min) {
      setPesanRekomendasi('👍 Harga saat ini cocok untuk menjual cabai.');
    } else {
      setPesanRekomendasi('⚠️ Harga dalam rentang, sebaiknya olah dahulu agar harga jual stabil atau lebih tinggi.');
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '480px' }}>
      <h2 className="mb-4">Input Rentang Harga</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="minHarga">
          <Form.Label>Harga Minimum</Form.Label>
          <Form.Control
            type="number"
            placeholder="Masukkan harga minimum"
            value={minHarga}
            onChange={(e) => setMinHarga(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="maxHarga">
          <Form.Label>Harga Maksimum</Form.Label>
          <Form.Control
            type="number"
            placeholder="Masukkan harga maksimum"
            value={maxHarga}
            onChange={(e) => setMaxHarga(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          Cek Harga
        </Button>
      </Form>

      {pesanRekomendasi && (
        <Alert className="mt-4" variant={pesanRekomendasi.includes('👍') ? 'success' : 'warning'}>
          {pesanRekomendasi}
        </Alert>
      )}

      <div className="mt-5 text-muted" style={{ fontSize: '0.9rem' }}>
        <strong>Harga Bulan Ini:</strong> Rp {hargaBulanIni.toLocaleString()}
      </div>
    </Container>
  );
}
