import { useRef, useState, useEffect } from 'react';
import { Card, Alert, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

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
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          setError('Tidak bisa mengakses kamera: ' + err.message);
        });
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
      reader.onload = (event) => {
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
    reader.onload = (event) => {
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

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Response bukan JSON valid');
      }

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
    <div className="container py-4">
      <div className="mb-4 d-flex flex-wrap gap-3 justify-content-center">
        <Button variant="success" size="lg" onClick={startCamera} disabled={!!imageFile || isRealtime}>
          <i className="bi bi-camera-video"></i> Buka Kamera
        </Button>
        <Button variant="primary" size="lg" onClick={capturePhoto} disabled={!videoRef.current || !videoRef.current.srcObject || !!imageFile || isRealtime}>
          <i className="bi bi-camera"></i> Foto Daun Sekarang
        </Button>
        <div>
          <label htmlFor="fileInput" className="btn btn-secondary btn-lg">
            <i className="bi bi-upload"></i> Pilih Gambar
          </label>
          <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} disabled={imageFile || isRealtime} style={{ display: 'none' }} />
        </div>
        {!isRealtime ? (
          <Button variant="warning" size="lg" onClick={startRealtimeDetection} disabled={!videoRef.current || !videoRef.current.srcObject}>
            <i className="bi bi-play-circle"></i> Mulai Deteksi Otomatis
          </Button>
        ) : (
          <Button variant="danger" size="lg" onClick={stopRealtimeDetection}>
            <i className="bi bi-stop-circle"></i> Stop Deteksi Otomatis
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {loading && <Alert variant="info" className="text-center">Sedang memeriksa gambar daun...</Alert>}

      <div className="mb-3 text-center">
        <video ref={videoRef} style={{ width: '100%', maxHeight: '400px', borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} autoPlay muted playsInline />
      </div>

      {imageSrc && (
        <div className="mb-4 text-center">
          <h5>📷 Gambar Daun</h5>
          <img src={imageSrc} alt="Preview" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', border: '2px solid #ccc' }} />
        </div>
      )}

      {result && (
        <Card className="mb-4 shadow">
          <Card.Body>
            <Card.Title className="text-success fw-bold">✅ Hasil Deteksi</Card.Title>
            <Card.Text>
              <p><strong>Jenis Penyakit:</strong> {result.data.label}</p>
              <p><strong>Tingkat Keyakinan:</strong></p>
              <ul>
                {result.data.confidences.map((item, index) => (
                  <li key={index}>
                    {item.label}: <strong>{(item.confidence * 100).toFixed(2)}%</strong>
                  </li>
                ))}
              </ul>
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default DeteksiPenyakitContent;