import { Row, Col } from 'react-bootstrap';
import KameraControls from '@/components/DeteksiPenyakit/KameraControls';
import KameraVideo from '@/components/DeteksiPenyakit/KameraVideo';
import PreviewGambar from '@/components/DeteksiPenyakit/PreviewGambar';
import HasilDeteksi from '@/components/DeteksiPenyakit/HasilDeteksi';
import useDeteksiPenyakit from '@/hooks/useDeteksiPenyakit';

function DeteksiPenyakitContent() {
  const {
    videoRef,
    canvasRef,
    imageSrc,
    result,
    error,
    loading,
    isRealtime,
    startCamera,
    stopRealtimeDetection,
    capturePhoto,
    handleFileChange,
    resetAll,
    startRealtimeDetection,
  } = useDeteksiPenyakit();

  return (
    <>
      <h4 className="mb-3">Deteksi Penyakit Daun Cabai</h4>

      <KameraControls
        startCamera={startCamera}
        capturePhoto={capturePhoto}
        handleFileChange={handleFileChange}
        startRealtimeDetection={startRealtimeDetection}
        stopRealtimeDetection={stopRealtimeDetection}
        resetAll={resetAll}
        isRealtime={isRealtime}
        videoRef={videoRef}
        imageSrc={imageSrc}
      />

      <KameraVideo videoRef={videoRef} />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Memproses gambar...</div>}

      <Row>
        {imageSrc && (
          <Col md={6}><PreviewGambar src={imageSrc} /></Col>
        )}
        {result?.data && (
          <Col md={6}><HasilDeteksi result={result} /></Col>
        )}
      </Row>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}

export default DeteksiPenyakitContent;
