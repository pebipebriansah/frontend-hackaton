import BaseCard from './BaseCard';
import cabaiImages from './assets/cabaiImages'; // Pastikan untuk mengimpor gambar

function formatRupiah(number) {
  if (typeof number !== 'number') return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

export default function PrediksiHargaCabaiList({ dataCabai }) {
  const bgGradient = 'linear-gradient(135deg, #e3f2fd, #bbdefb)'; // biru muda
  const borderColor = '#90caf9';

  return (
    <div className="row">
      {dataCabai.map((cabai, index) => (
        <div className="col-md-4 mb-3" key={index}>
          <BaseCard
            title={cabai.nama}
            loading={cabai.harga_bulan_ini === null}
            style={{
              background: bgGradient,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
              borderRadius: '16px',
            }}
          >
            <img 
              src={cabaiImages[cabai.nama]} // Mengambil gambar berdasarkan nama cabai
              alt={cabai.nama}
              style={{ width: '100%', borderRadius: '16px 16px 0 0' }} // Gambar dengan styling
            />
            <div className="mb-3">
              <small className="text-muted">Harga Bulan Ini</small>
              <div className="fs-4 fw-bold text-primary">
                {formatRupiah(cabai.harga_bulan_ini)}
              </div>
            </div>

            {cabai.harga_bulan_lalu !== null && (
              <div>
                <small className="text-muted">Harga Bulan Lalu</small>
                <div className="fw-medium text-dark">
                  {formatRupiah(cabai.harga_bulan_lalu)}
                </div>
              </div>
            )}
          </BaseCard>
        </div>
      ))}
    </div>
  );
}
