import { useRef, useState, useEffect } from 'react';

function DeteksiPenyakitContent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const ongoingRequest = useRef(false); // untuk mencegah request bertumpuk

  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);

  // Start kamera
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

  // Stop kamera dan realtime detection
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture foto sekali
  const capturePhoto = () => {
    if (isRealtime) return; // disable jika realtime aktif

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

      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);

      uploadImage(file);
    }, 'image/png');
  };

  // Handle file upload manual
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setResult(null);
    setError(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);

    uploadImage(file);
  };

  // Upload gambar ke backend dan proses response
  const uploadImage = async (file) => {
    if (ongoingRequest.current) return; // cegah request tumpuk
    ongoingRequest.current = true;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/deteksi-penyakit', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();

      if (!response.ok) {
        let errMsg = 'Gagal deteksi penyakit';
        try {
          const errJson = JSON.parse(text);
          errMsg = errJson.error || errMsg;
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
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      ongoingRequest.current = false;
    }
  };

  // Capture frame untuk realtime detection
  const captureFrameRealtime = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (ongoingRequest.current) return; // skip jika masih request sebelumnya berjalan

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], "frame.png", { type: "image/png" });

      // Revoke object URL sebelumnya supaya tidak bocor memori
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      setImageSrc(URL.createObjectURL(file));

      uploadImage(file);
    }, 'image/png');
  };

  // Mulai realtime detection dengan interval
  const startRealtimeDetection = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      setError('Kamera belum aktif');
      return;
    }
    setError(null);
    setResult(null);
    setIsRealtime(true);

    // Capture frame tiap 1.5 detik
    intervalRef.current = setInterval(() => {
      captureFrameRealtime();
    }, 1500);
  };

  // Stop realtime detection
  const stopRealtimeDetection = () => {
    setIsRealtime(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Reset preview dan hasil realtime
    setImageSrc(null);
    setResult(null);
    setLoading(false);
    ongoingRequest.current = false;
  };

  // Bersihkan saat komponen unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopCamera();
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);

  return (
    <>
      <div className="mb-3 d-flex gap-2 align-items-center flex-wrap">
        <button type="button" className="btn btn-success" onClick={startCamera} disabled={!!imageFile || isRealtime}>
          Buka Kamera
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={capturePhoto}
          disabled={!videoRef.current || !videoRef.current.srcObject || !!imageFile || isRealtime}
        >
          Ambil Foto
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={imageFile || isRealtime}
          style={{ cursor: imageFile || isRealtime ? 'not-allowed' : 'pointer' }}
        />

        {!isRealtime ? (
          <button className="btn btn-warning" onClick={startRealtimeDetection} disabled={!videoRef.current || !videoRef.current.srcObject}>
            Mulai Realtime Detection
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopRealtimeDetection}>
            Stop Realtime Detection
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Memproses gambar...</div>}

      <div className="mb-3">
        <video
          ref={videoRef}
          style={{ width: '100%', maxHeight: '400px', borderRadius: '10px' }}
          autoPlay
          muted
          playsInline
        />
      </div>

      {imageSrc && (
        <div className="mb-3">
          <h5>Gambar Preview:</h5>
          <img src={imageSrc} alt="Preview" style={{ width: '100%', borderRadius: '10px' }} />
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <strong>Hasil Deteksi:</strong> {result.label} <br />
          <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}

export default DeteksiPenyakitContent;
