// File: components/DeteksiPenyakit/KameraControls.jsx
import { Button } from 'react-bootstrap';
import { CameraVideo, Camera, Upload, Play, Stop } from 'react-bootstrap-icons';

function KameraControls({
  imageFile,
  isRealtime,
  startCamera,
  capturePhoto,
  handleFileChange,
  startRealtimeDetection,
  stopRealtimeDetection,
  resetAll,
  isCameraOn,
}) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      <Button variant="success" onClick={startCamera} disabled={!!imageFile || isRealtime}>
        <CameraVideo className="me-1" /> Buka Kamera
      </Button>
      <Button variant="primary" onClick={capturePhoto} disabled={!isCameraOn || !!imageFile || isRealtime}>
        <Camera className="me-1" /> Ambil Foto
      </Button>
      <label className="btn btn-outline-secondary mb-0">
        <Upload className="me-1" /> Upload Gambar
        <input type="file" accept="image/*" onChange={handleFileChange} hidden disabled={imageFile || isRealtime} />
      </label>
      {!isRealtime ? (
        <Button variant="warning" onClick={startRealtimeDetection} disabled={!isCameraOn}>
          <Play className="me-1" /> Mulai Realtime
        </Button>
      ) : (
        <Button variant="danger" onClick={stopRealtimeDetection}>
          <Stop className="me-1" /> Stop Realtime
        </Button>
      )}
      <Button variant="secondary" onClick={resetAll}>Reset</Button>
    </div>
  );
}

export default KameraControls;
