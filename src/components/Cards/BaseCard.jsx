import { Card, Spinner } from 'react-bootstrap';

export default function BaseCard({ title, icon, loading, children, style }) {
  return (
    <Card className="mb-3" style={style}>
      <Card.Body>
        <Card.Title>
          {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
          {title}
        </Card.Title>
        {loading ? <Spinner animation="border" size="sm" /> : children}
      </Card.Body>
    </Card>
  );
}
