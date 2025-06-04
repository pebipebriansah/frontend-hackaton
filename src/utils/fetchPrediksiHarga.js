import { API_BASE_URL } from "./apiConfig";
const fetchPrediksiHarga = async (setHargaPrediksi, setMSE, setError) => {
  try {
    const res = await fetch(`${API_BASE_URL}/harga/harga/prediksi`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    setHargaPrediksi(data.prediksi);
    setMSE(data.mse);
  } catch (err) {
    setError('Gagal memuat prediksi harga.',err);
    return null;
  }
};

export default fetchPrediksiHarga;
