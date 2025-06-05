import BaseCard from './BaseCard';

export default function PrediksiHargaCard({ hargaPrediksi, meanSquaredError }) {
  return (
    <BaseCard title="Prediksi Harga Cabai" loading={hargaPrediksi === null}>
      <p>Prediksi harga bulan depan: Rp {hargaPrediksi}</p>
      <p>Mean Squared Error: {meanSquaredError}</p>
    </BaseCard>
  );
}
