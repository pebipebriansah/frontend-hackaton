import { API_BASE_URL } from "./apiConfig";
const fetchHargaCabai = async (setDataCabai, setError) => {
  try {
    const res = await fetch(`${API_BASE_URL}/harga/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    setDataCabai(data.data); // Mengatur state dengan data cabai
  } catch (err) {
    setError('Gagal memuat harga cabai.', err);
    return null;
  }
};
export default fetchHargaCabai;