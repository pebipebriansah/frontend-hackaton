import { useRef, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/api/apiConfig';
function useDeteksiPenyakit() {
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

  const uploadImage = async (file) => {
    if (ongoingRequest.current) return;
    ongoingRequest.current = true;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/deteksi/predict`, {
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
    stopCamera();
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

  return {
    videoRef,
    canvasRef,
    imageSrc,
    imageFile,
    error,
    loading,
    result,
    isRealtime,
    startCamera,
    stopCamera,
    resetAll,
    capturePhoto,
    handleFileChange,
    startRealtimeDetection,
    stopRealtimeDetection,
    isCameraOn: !!videoRef.current?.srcObject
  };
}

export default useDeteksiPenyakit;