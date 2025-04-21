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
    } else {
      console.warn('未找到認證令牌，請先登入');
      // 不要在这里重定向，让具体的 API 调用处理未认证的情况
    }
    return config;
  },
  (error) => {
    console.error('請求攔截器錯誤:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API 錯誤 [${status}]:`, data);
      
      switch (status) {
        case 401:
          console.warn('認證失敗，清除本地令牌');
          localStorage.removeItem('token');
          window.location.href = '/';
          break;
        case 403:
          console.error('權限不足:', data.message || '您沒有執行此操作的權限');
          break;
        case 404:
          console.error('資源未找到:', data.message || '請求的資源不存在');
          break;
        case 500:
          console.error('伺服器錯誤:', data.message || '請稍後再試');
          break;
        default:
          console.error('請求錯誤:', data.message || '未知錯誤');
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