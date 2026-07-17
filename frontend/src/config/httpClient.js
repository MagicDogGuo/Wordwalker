import axios from 'axios';

// Single axios instance shared by the whole app. Centralizing it here means
// the Bearer token is always attached the same way, regardless of which
// component or hook triggers the request (no more manual header wiring or
// mixing Context token vs localStorage token).
const httpClient = axios.create();

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default httpClient;
