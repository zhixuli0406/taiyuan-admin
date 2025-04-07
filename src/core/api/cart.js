import apiClient from './apiClient';

const cartApi = {
  // 获取购物车
  get: () => {
    return apiClient.get('/cart');
  },

  // 添加商品到购物车
  add: (productData) => {
    return apiClient.post('/cart', productData);
  },

  // 更新购物车商品数量
  update: (productData) => {
    return apiClient.put('/cart', productData);
  },

  // 从购物车移除商品
  remove: (productId) => {
    return apiClient.delete(`/cart/${productId}`);
  },

  // 清空购物车
  clear: () => {
    return apiClient.delete('/cart');
  }
};

export default cartApi; 