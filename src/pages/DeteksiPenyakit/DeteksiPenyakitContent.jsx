import React from 'react';
import { Alert, Spinner, Row, Col } from 'react-bootstrap';
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
    imageFile,
    error,
    loading,
    result,
    isRealtime,
    startCamera,
    resetAll,
    capturePhoto,
    handleFileChange,
    startRealtimeDetection,
    stopRealtimeDetection,
    isCameraOn
  } = useDeteksiPenyakit();

  return (
    <>
      <h4 className="mb-3">Deteksi Penyakit Daun Cabai</h4>

      <KameraControls
        imageFile={imageFile}
        isRealtime={isRealtime}
        startCamera={startCamera}
        capturePhoto={capturePhoto}
        handleFileChange={handleFileChange}
        startRealtimeDetection={startRealtimeDetection}
        stopRealtimeDetection={stopRealtimeDetection}
        resetAll={resetAll}
        isCameraOn={isCameraOn}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <Alert variant="info">
          <Spinner animation="border" size="sm" className="me-2" />
          Memproses gambar...
        </Alert>
      )}

      <KameraVideo videoRef={videoRef} />

      <Row>
        {imageSrc && (
          <Col md={6}>
            <PreviewGambar imageSrc={imageSrc} />
          </Col>
        )}
        {result && (
          <Col md={6}>
            <HasilDeteksi result={result} />
          </Col>
        )}
      </Row>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}

export default DeteksiPenyakitContent;