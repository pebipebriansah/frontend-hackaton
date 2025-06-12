// hooks/useSpeechRecognition.js
import { useEffect, useState } from 'react';
import { azureConfig } from '@/api/apiConfig'; // Pastikan path ini sesuai

const useSpeechRecognition = () => {
  const [listening, setListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Azure Speech SDK
  useEffect(() => {
    if (!window.SpeechSDK) {
      const script = document.createElement('script');
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
      script.onload = () => console.log('Azure Speech SDK loaded');
      script.onerror = () => setErrorMsg('Gagal memuat Azure Speech SDK.');
      document.body.appendChild(script);
    }
  }, []);

  const startListening = async (onResult) => {
  setListening(true);
  setRecognizedText('');
  setErrorMsg('');

  try {
    const SpeechSDK = window.SpeechSDK;
    if (!SpeechSDK) throw new Error('Azure Speech SDK belum tersedia.');

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      azureConfig.token,
      azureConfig.region
    );
    speechConfig.speechRecognitionLanguage = 'id-ID';

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        setListening(false);
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setRecognizedText(result.text); // ← local update
          if (onResult) onResult(result.text); // ← penting: kirim ke luar!
        } else {
          setErrorMsg('Tidak dapat mengenali suara. Coba lagi.');
        }
        recognizer.close();
      },
      (err) => {
        setListening(false);
        setErrorMsg(err.errorDetails || 'Terjadi kesalahan saat mengenali suara');
        recognizer.close();
      }
    );
    } catch (err) {
      setListening(false);
      setErrorMsg('Gagal memulai pengenalan suara. Periksa koneksi dan mikrofon.');
      console.error(err); // debug
    }
  };
  const resetTranscript = () => {
    setRecognizedText('');
    setErrorMsg('');
  };

  return {
    startListening,
    listening,
    transcript: recognizedText,
    errorMsg,
    resetTranscript
  };
};

export default useSpeechRecognition;
