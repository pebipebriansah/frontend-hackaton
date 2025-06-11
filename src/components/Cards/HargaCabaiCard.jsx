import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import BaseCard from './BaseCard';

function formatRupiah(number) {
  if (typeof number !== 'number') return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

export default function HargaCabaiCard({ hargaBulanIni, hargaBulanLalu }) {
  const naik = hargaBulanIni > hargaBulanLalu;
  const turun = hargaBulanIni < hargaBulanLalu;

  // Gradasi warna berdasarkan status
  const bgGradient = naik
    ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)'       // hijau muda
    : turun
    ? 'linear-gradient(135deg, #ffebee, #ffcdd2)'       // merah muda
    : 'linear-gradient(135deg, #f5f5f5, #e0e0e0)';       // abu stabil

  const borderColor = naik
    ? '#66bb6a'
    : turun
    ? '#ef5350'
    : '#bdbdbd';

  const statusColor = naik
    ? 'text-success'
    : turun
    ? 'text-danger'
    : 'text-muted';

  const statusIcon = naik ? <TrendingUp size={20} className="me-1" /> :
                      turun ? <TrendingDown size={20} className="me-1" /> :
                      <Minus size={20} className="me-1" />;

  const statusText = naik ? 'Harga Naik' : turun ? 'Harga Turun' : 'Harga Stabil';

  return (
    <BaseCard
      title="Harga Cabai"
      icon={<TrendingUp />}
      style={{
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
        borderRadius: '16px',
      }}
    >
      <div className="mb-3">
        <small className="text-muted">Harga Bulan Lalu</small>
        <div className="fw-semibold text-dark">
          {formatRupiah(hargaBulanLalu)}
        </div>
      </div>

      <div className="mb-3">
        <small className="text-muted">Harga Bulan Ini</small>
        <div className="fs-4 fw-bold text-primary">
          {formatRupiah(hargaBulanIni)}
        </div>
      </div>

      {(typeof hargaBulanIni === 'number' && typeof hargaBulanLalu === 'number') && (
        <div className={`d-flex align-items-center gap-2 mt-2 ${statusColor} fw-semibold`}>
          {statusIcon} {statusText}
        </div>
      )}
    </BaseCard>
  );
}
