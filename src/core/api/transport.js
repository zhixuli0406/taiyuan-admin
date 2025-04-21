import apiClient from './apiClient';

const transportApi = {
  // 获取所有运输方式
  getAll: (isActive) => {
    const params = isActive ? { isActive: true } : {};
    return apiClient.get('/transports', { params });
  },

  // 获取单个运输方式
  getById: (id) => {
    return apiClient.get(`/transports/${id}`);
  },

  // 创建运输方式
  create: (data) => {
    return apiClient.post('/transports', data);
  },

  // 更新运输方式
  update: (id, data) => {
    return apiClient.put(`/transports/${id}`, data);
  },

  // 删除运输方式
  delete: (id) => {
    return apiClient.delete(`/transports/${id}`);
  },

  // 更新运输方式状态
  updateTransportStatus: (id, status) => {
    return apiClient.patch(`/transports/${id}/status`, { status });
  }
};

export default transportApi; 