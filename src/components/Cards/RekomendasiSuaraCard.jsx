import { Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Button } from 'react-bootstrap';
import BaseCard from './BaseCard';

export default function RekomendasiSuaraCard({
  loading,
  recommendation,
  listening,
  recognizedText,
  onStartListening,
}) {
  return (
    <BaseCard title="Rekomendasi dari Suara" icon={<Mic />} loading={loading}>
      <Button
        variant={listening ? 'danger' : 'primary'}
        onClick={onStartListening}
        disabled={loading}
      >
        {listening ? 'Mendengarkan...' : 'Mulai Bicara'}
      </Button>
      <p className="mt-2">Teks: {recognizedText}</p>
      <div className="mt-2">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation}</ReactMarkdown>
      </div>
    </BaseCard>
  );
}
