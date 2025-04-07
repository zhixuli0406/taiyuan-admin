import apiClient from './apiClient';

const customersApi = {
  // 获取客户列表
  getAll: (params = {}) => {
    return apiClient.get('/customers', { params });
  },

  // 创建新客户
  create: (customerData) => {
    return apiClient.post('/customers', customerData);
  },

  // 同步Auth0用户到本地数据库
  sync: () => {
    return apiClient.post('/customers/sync');
  },

  // 获取当前登录客户信息
  getMe: () => {
    return apiClient.get('/customers/me');
  }
};

export default customersApi; 