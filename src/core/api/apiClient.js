import axios from 'axios';

const API_BASE_URL = 'https://api.taiyuan.dudustudio.monster';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
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

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 处理未授权
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 处理权限不足
          console.error('权限不足');
          break;
        case 404:
          // 处理资源未找到
          console.error('资源未找到');
          break;
        default:
          console.error('请求错误:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 