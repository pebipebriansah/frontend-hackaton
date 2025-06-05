import { API_BASE_URL } from "./apiConfig";
const sendCuacaToBackend = async (cuacaData, setRekomendasi, setError, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/cuaca/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuacaData),
    });
    const result = await res.json();
    setRekomendasi(result.rekomendasi || '');
  } catch (err) {
    setError('Gagal mengirim data cuaca.', err);
  } finally {
    setLoading(false);
  }
};

export default sendCuacaToBackend;
