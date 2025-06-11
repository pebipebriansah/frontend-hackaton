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
    <BaseCard
      title="Rekomendasi dari Suara"
      icon={<Mic />}
      loading={loading}
      style={{
        background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)',
        border: '1px solid #bcccdc',
        boxShadow: '0 6px 12px rgba(0,0,0,0.07)',
        borderRadius: '16px',
      }}
    >
      <Button
        variant={listening ? 'danger' : 'primary'}
        onClick={onStartListening}
        disabled={loading}
        className="w-100 mb-3 fw-semibold"
        size="lg"
      >
        {listening ? 'Mendengarkan...' : 'Mulai Bicara'}
      </Button>

      <div className="mb-3">
        <small className="text-muted">Teks hasil pengenalan suara:</small>
        <pre
          style={{
            backgroundColor: '#eef4f8',
            padding: '10px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            minHeight: '60px',
            color: '#2c3e50',
            overflowX: 'auto',
          }}
        >
          {recognizedText || '-'}
        </pre>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          maxHeight: '200px',
          overflowY: 'auto',
          color: '#34495e',
        }}
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{recommendation || 'Tidak ada rekomendasi saat ini.'}</ReactMarkdown>
      </div>
    </BaseCard>
  );
}
