import apiClient from './apiClient';

const productsApi = {
  // 创建产品
  create: (productData) => {
    return apiClient.post('/products', productData);
  },

  // 获取产品列表
  getAll: (params = {}) => {
    return apiClient.get('/products', { params });
  },

  // 获取单个产品
  getById: (id) => {
    return apiClient.get(`/products/${id}`);
  },

  // 更新产品
  update: (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },

  // 删除产品
  delete: (id) => {
    return apiClient.delete(`/products/${id}`);
  }
};

export default productsApi; 