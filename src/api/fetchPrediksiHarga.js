import { API_BASE_URL } from "./apiConfig";
const fetchPrediksiHarga = async (setHargaPrediksi, setMSE, setError) => {
  try {
    const res = await fetch(`${API_BASE_URL}/harga/prediksi`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    setHargaPrediksi(data.harga_bulan_depan);
    setMSE(data.mean_squared_error);
  } catch (err) {
    setError('Gagal memuat prediksi harga.',err);
    return null;
  }
};

export default fetchPrediksiHarga;
