export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const SPEECH_KEY = import.meta.env.VITE_SPEECH_API_KEY
export const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION

export default {
  baseUrl : API_BASE_URL,
};

export const azureConfig = {
  token: SPEECH_KEY,
  region: SPEECH_REGION,
};
