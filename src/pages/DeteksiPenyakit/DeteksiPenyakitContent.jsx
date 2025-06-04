import { useRef, useState, useEffect } from 'react';
import { Card, Alert, Button, Row, Col, Spinner } from 'react-bootstrap';
import { CameraVideo, Camera, Upload, Play, Stop } from 'react-bootstrap-icons';
import { ProgressBar } from 'react-bootstrap';


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
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
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

      const text = await response.text();
      if (!response.ok) {
        let errMsg = 'Gagal deteksi penyakit';
        try {
          const errJson = JSON.parse(text);
          errMsg = errJson.message || errMsg;
        } catch {
          errMsg = text || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = JSON.parse(text);
      if (data.success) {
        setResult(data);
      } else {
        throw new Error(data.message || 'Gagal mendeteksi penyakit');
      }
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
    if (!videoRef.current || !videoRef.current.srcObject) {
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
                <Card.Text>
                  <strong>Label:</strong> {result.data.label} <br />
                  <strong>Confidence:</strong>
                  <ProgressBar
                    now={result.data.confidence * 100}
                    label={`${(result.data.confidence * 100).toFixed(2)}%`}
                    className="mt-2"
                    style={{ height: '1.5rem' }}
                  />
                </Card.Text>
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
