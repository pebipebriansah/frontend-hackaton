import { TrendingUp, TrendingDown } from 'lucide-react';
import BaseCard from './BaseCard';

export default function HargaCabaiCard({ hargaBulanIni, hargaBulanLalu }) {
  return (
    <BaseCard title="Harga Cabai" icon={<TrendingUp />} >
      <p>Bulan lalu: Rp {hargaBulanLalu ?? '-'} / kg</p>
      <p>Bulan ini: Rp {hargaBulanIni ?? '-'} / kg</p>
      <p>
        {hargaBulanIni && hargaBulanLalu && (
          hargaBulanIni > hargaBulanLalu ? (
            <span className="text-success"><TrendingUp /> Naik</span>
          ) : hargaBulanIni < hargaBulanLalu ? (
            <span className="text-danger"><TrendingDown /> Turun</span>
          ) : (
            <span className="text-muted">Stabil</span>
          )
        )}
      </p>
    </BaseCard>
  );
}
