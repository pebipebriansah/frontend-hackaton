import { API_BASE_URL } from "./apiConfig";

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Login gagal');
  }

  return data;
}
export async function registerUser({ nama_petani, email, password, alamat, telepon }) {
  const response = await fetch(`${API_BASE_URL}/petani/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_petani,
        email,
        password,
        alamat,
        telepon,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.messages?.error || 'Registrasi gagal');
  }

  return data;
}