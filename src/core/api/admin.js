import apiClient from './apiClient';

const adminApi = {
  login: (email, password) => {
    return apiClient.post('/admin/login', { email, password });
  },

  create: (adminData) => {
    return apiClient.post('/admin', adminData);
  },

  getAll: () => {
    return apiClient.get('/admin');
  },

  update: (id, adminData) => {
    return apiClient.put(`/admin/${id}`, adminData);
  }
};

export default adminApi; 