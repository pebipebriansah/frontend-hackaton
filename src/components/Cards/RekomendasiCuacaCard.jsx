import { Droplet } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import BaseCard from './BaseCard';

export default function RekomendasiCuacaCard({ loading, recommendation }) {
  return (
    <BaseCard title="Rekomendasi Cuaca" icon={<Droplet />} loading={loading}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation}</ReactMarkdown>
    </BaseCard>
  );
}
