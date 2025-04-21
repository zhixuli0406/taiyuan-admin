import apiClient from './apiClient';

const productsApi = {
  // 创建产品
  create: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  },

  // 创建分类
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/categories', categoryData);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  },

  // 获取产品列表
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  },

  // 获取单个产品
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  },

  // 更新产品
  update: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  },

  // 删除产品
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  },

  // 获取预签名URL
  getPresignedUrl: async (fileType) => {
    try {
      const response = await apiClient.get('/products/presigned-url', { params: { fileType } });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('請先登入後再操作');
      }
      throw error;
    }
  }
};

export default productsApi; 