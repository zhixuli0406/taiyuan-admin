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
  },

  // 批量更新分类顺序和父级关系
  updateOrder: (orderData) => {
    // 使用 Promise.all 并行处理所有更新请求
    return Promise.all(
      orderData.map(({ id, order, parentCategory }) => 
        apiClient.put(`/categories/${id}`, { 
          order,
          parentCategory 
        })
      )
    );
  }
};

export default categoriesApi; 