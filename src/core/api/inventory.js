import apiClient from './apiClient';

const inventoryApi = {
  // 创建库存
  create: (inventoryData) => {
    return apiClient.post('/inventory', inventoryData);
  },

  // 更新库存数量
  update: (id, quantityChange) => {
    return apiClient.put(`/inventory/${id}`, { quantityChange });
  },

  // 查询库存状态
  getByProduct: (productId) => {
    return apiClient.get(`/inventory/${productId}`);
  },

  // 查询低库存商品
  getLowStock: () => {
    return apiClient.get('/inventory/low-stock');
  },

  // 重置库存
  reset: (productId, quantity) => {
    return apiClient.put(`/inventory/reset/${productId}`, { quantity });
  }
};

export default inventoryApi; 