import { Card, Spinner } from 'react-bootstrap';

export default function BaseCard({ title, icon, loading, children, style }) {
  return (
    <Card
      className="mb-4 shadow-sm border-0"
      style={{
        borderRadius: '16px',
        background: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease-in-out',
        ...style,
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          {icon && (
            <div
              className="me-2 d-flex justify-content-center align-items-center"
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#f1f3f5',
                borderRadius: '50%',
              }}
            >
              {icon}
            </div>
          )}
          <h5 className="mb-0 fw-semibold text-dark">{title}</h5>
        </div>

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: '100px' }}
          >
            <Spinner animation="border" role="status" variant="primary" />
          </div>
        ) : (
          <div style={{ transition: 'opacity 0.3s ease-in-out' }}>
            {children}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
