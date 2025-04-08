import axios from 'axios';

const API_BASE_URL = 'https://api.taiyuan.dudustudio.monster';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/';
          break;
        case 403:
          console.error('權限不足');
          break;
        case 404:
          console.error('資源未找到');
          break;
        case 500:
          console.error('伺服器錯誤:', error.response.data.error || '請稍後再試');
          break;
        default:
          console.error('請求錯誤:', error.response.data);
      }
    } else if (error.request) {
      console.error('網路錯誤:', '請檢查您的網路連接');
    } else {
      console.error('請求配置錯誤:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient; 