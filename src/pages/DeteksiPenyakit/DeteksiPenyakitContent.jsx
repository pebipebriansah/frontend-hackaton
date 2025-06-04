import { useRef, useState, useEffect } from 'react';
import { Card, Alert, Button, Row, Col, Spinner, ProgressBar } from 'react-bootstrap';
import { CameraVideo, Camera, Upload, Play, Stop } from 'react-bootstrap-icons';

function DeteksiPenyakitContent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const ongoingRequest = useRef(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);

  const startCamera = () => {
    setError(null);
    setResult(null);
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(err => setError('Tidak bisa mengakses kamera: ' + err.message));
    } else {
      setError('Browser tidak mendukung kamera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const resetAll = () => {
    stopCamera();
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    ongoingRequest.current = false;
    setIsRealtime(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (isRealtime) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], "captured.png", { type: "image/png" });
      setImageFile(file);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onload = event => {
        if (imageSrc) URL.revokeObjectURL(imageSrc);
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);

      uploadImage(file);
    }, 'image/png');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = event => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);

    uploadImage(file);
  };

  const uploadImage = async (file) => {
    if (ongoingRequest.current) return;
    ongoingRequest.current = true;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/deteksi/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal deteksi penyakit');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      ongoingRequest.current = false;
    }
  };

  const captureFrameRealtime = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || ongoingRequest.current) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], "frame.png", { type: "image/png" });
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(URL.createObjectURL(file));
      uploadImage(file);
    }, 'image/png');
  };

  const startRealtimeDetection = () => {
    if (!videoRef.current?.srcObject) {
      setError('Kamera belum aktif');
      return;
    }
    setError(null);
    setResult(null);
    setIsRealtime(true);

    intervalRef.current = setInterval(() => {
      captureFrameRealtime();
    }, 1500);
  };

  const stopRealtimeDetection = () => {
    setIsRealtime(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopCamera(); // tambahkan stop kamera
    setImageSrc(null);
    setResult(null);
    setLoading(false);
    ongoingRequest.current = false;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopCamera();
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, []);

  return (
    <>
      <h4 className="mb-3">Deteksi Penyakit Daun Cabai</h4>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button variant="success" onClick={startCamera} disabled={!!imageFile || isRealtime}>
          <CameraVideo className="me-1" /> Buka Kamera
        </Button>
        <Button variant="primary" onClick={capturePhoto} disabled={!videoRef.current?.srcObject || !!imageFile || isRealtime}>
          <Camera className="me-1" /> Ambil Foto
        </Button>
        <label className="btn btn-outline-secondary mb-0">
          <Upload className="me-1" /> Upload Gambar
          <input type="file" accept="image/*" onChange={handleFileChange} hidden disabled={imageFile || isRealtime} />
        </label>
        {!isRealtime ? (
          <Button variant="warning" onClick={startRealtimeDetection} disabled={!videoRef.current?.srcObject}>
            <Play className="me-1" /> Mulai Realtime
          </Button>
        ) : (
          <Button variant="danger" onClick={stopRealtimeDetection}>
            <Stop className="me-1" /> Stop Realtime
          </Button>
        )}
        <Button variant="secondary" onClick={resetAll}>Reset</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <Alert variant="info">
          <Spinner animation="border" size="sm" className="me-2" />
          Memproses gambar...
        </Alert>
      )}

      <video
        ref={videoRef}
        style={{ width: '100%', maxHeight: '350px', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #ccc' }}
        autoPlay
        muted
        playsInline
      />

      <Row>
        {imageSrc && (
          <Col md={6}>
            <Card className="mb-3 shadow-sm">
              <Card.Header>Gambar Preview</Card.Header>
              <Card.Img variant="top" src={imageSrc} style={{ maxHeight: '300px', objectFit: 'cover' }} />
            </Card>
          </Col>
        )}
        {result && (
          <Col md={6}>
            <Card className="mb-3 shadow-sm">
              <Card.Header>Hasil Deteksi</Card.Header>
              <Card.Body>
                <Card.Text style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  <span>Label Prediksi: </span>
                  <span style={{ color: '#2c3e50' }}>{result.data.label}</span>
                </Card.Text>
                <div>
                  {result.data.confidences.map(({ label, confidence }) => {
                    const percent = confidence * 100;
                    let variant = 'danger';
                    if (percent > 75) variant = 'success';
                    else if (percent > 40) variant = 'warning';

                    return (
                      <div key={label} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', marginBottom: '0.25rem', color: '#34495e' }}>
                          <span>{label}</span>
                          <span>{percent.toFixed(2)}%</span>
                        </div>
                        <ProgressBar
                          now={percent}
                          variant={variant}
                          style={{ height: '1.5rem', borderRadius: '0.5rem' }}
                          animated={percent > 0}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}

export default DeteksiPenyakitContent;
