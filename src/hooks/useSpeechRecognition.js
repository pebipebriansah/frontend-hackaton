// hooks/useSpeechRecognition.js
import { useEffect, useState } from 'react';
import { azureConfig } from '../api/apiConfig'; // Pastikan path ini sesuai

const useSpeechRecognition = ({ onResult, onError }) => {
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Azure Speech SDK if not available
  useEffect(() => {
    if (!window.SpeechSDK) {
      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.onload = () => console.log('Speech SDK loaded');
      script.onerror = () => setErrorMsg('Gagal memuat Speech SDK.');
      document.body.appendChild(script);
    }
  }, []);

  const startListening = async () => {
    setListening(true);
    setRecognizedText('');
    setErrorMsg('');

    try {
      const SpeechSDK = window.SpeechSDK;
      if (!SpeechSDK) throw new Error('Speech SDK belum tersedia.');

      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        azureConfig.token, // Menggunakan token dari konfigurasi
        azureConfig.region // Menggunakan region dari konfigurasi
      );
      speechConfig.speechRecognitionLanguage = 'id-ID';

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(
        (result) => {
          setListening(false);
          if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            setRecognizedText(result.text);
            onResult(result.text);
          } else {
            setRecognizedText('Gagal mengenali suara. Silakan coba lagi.');
          }
          recognizer.close();
        },
        (error) => {
          setListening(false);
          onError(error.errorDetails || 'Terjadi kesalahan pengenalan suara');
          recognizer.close();
        }
      );
    } catch (err) {
      console.error('Speech recognition error:', err);
      setListening(false);
      onError('Gagal memulai pengenalan suara. Periksa koneksi dan mikrofon Anda.');
    }
  };

  // Cleanup function to stop recognition when the component unmounts
  useEffect(() => {
    return () => {
      if (listening) {
        setListening(false);
      }
    };
  }, [listening]);

  return { listening, recognizedText, errorMsg, startListening };
};

export default useSpeechRecognition;
