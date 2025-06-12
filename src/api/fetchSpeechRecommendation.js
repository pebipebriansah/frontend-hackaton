import { API_BASE_URL } from './apiConfig';

const fetchSpeechRecommendation = async (text, setRekomendasi, setError, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/rekomendasi/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keluhan: text }),
    });

    const data = await res.json();
    setRekomendasi(data.rekomendasi || '');
  } catch (err) {
    setError('Gagal mendapatkan rekomendasi dari suara.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export default fetchSpeechRecommendation;
