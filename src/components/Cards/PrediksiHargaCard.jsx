import BaseCard from './BaseCard';

function formatRupiah(number) {
  if (typeof number !== 'number') return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

export default function PrediksiHargaCard({ hargaPrediksi, meanSquaredError }) {
  const bgGradient = 'linear-gradient(135deg, #e3f2fd, #bbdefb)'; // biru muda
  const borderColor = '#90caf9';

  return (
    <BaseCard
      title="Prediksi Harga Cabai"
      loading={hargaPrediksi === null}
      style={{
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
        borderRadius: '16px',
      }}
    >
      <div className="mb-3">
        <small className="text-muted">Harga Bulan Depan (prediksi)</small>
        <div className="fs-4 fw-bold text-primary">
          {formatRupiah(hargaPrediksi)}
        </div>
      </div>

      {meanSquaredError !== null && (
        <div>
          <small className="text-muted">Mean Squared Error (MSE)</small>
          <div className="fw-medium text-dark">
            {meanSquaredError.toFixed(2)}
          </div>
        </div>
      )}
    </BaseCard>
  );
}
