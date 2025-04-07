import apiClient from './apiClient';

const adminApi = {
  // 管理员登录
  login: (email, password) => {
    return apiClient.post('/admin/login', { email, password });
  },

  // 创建新管理员
  create: (adminData) => {
    return apiClient.post('/admin', adminData);
  },

  // 获取管理员列表
  getAll: () => {
    return apiClient.get('/admin');
  },

  // 更新管理员信息
  update: (id, adminData) => {
    return apiClient.put(`/admin/${id}`, adminData);
  }
};

export default adminApi; 