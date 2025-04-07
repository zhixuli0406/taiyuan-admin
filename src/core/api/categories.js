import apiClient from './apiClient';

const categoriesApi = {
  // 获取分类列表
  getAll: () => {
    return apiClient.get('/categories');
  },

  // 创建分类
  create: (categoryData) => {
    return apiClient.post('/categories', categoryData);
  },

  // 获取单个分类
  getById: (id) => {
    return apiClient.get(`/categories/${id}`);
  },

  // 更新分类
  update: (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  // 删除分类
  delete: (id) => {
    return apiClient.delete(`/categories/${id}`);
  }
};

export default categoriesApi; 