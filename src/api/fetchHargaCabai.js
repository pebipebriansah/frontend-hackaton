import { API_BASE_URL } from "./apiConfig";
const fetchHargaCabai = async (setHargaIni, setHargaLalu, setError) => {
  try {
    const res = await fetch(`${API_BASE_URL}/harga/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    setHargaIni(data.harga_bulan_ini);
    setHargaLalu(data.harga_bulan_lalu);
  } catch (err) {
    setError('Gagal memuat harga cabai.', err);
    return null;
  }
};

export default fetchHargaCabai;
