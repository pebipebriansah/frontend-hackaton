import { Form, Button, InputGroup } from 'react-bootstrap';

export default function InputKeluhan({ keluhan, setKeluhan, onKirimKeluhan, startListening, listening }) {
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Keluhan Tanaman</Form.Label>
        <InputGroup>
          <Form.Control
            type="text"
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            placeholder="Ceritakan masalah tanaman Anda..."
          />
          <Button variant="secondary" onClick={startListening} disabled={listening}>
            🎙️
          </Button>
        </InputGroup>
      </Form.Group>
      <Button variant="primary" className="w-100" onClick={onKirimKeluhan} disabled={!keluhan}>
        Kirim Keluhan
      </Button>
    </>
  );
}
