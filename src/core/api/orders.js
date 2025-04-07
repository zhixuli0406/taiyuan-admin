import apiClient from './apiClient';

const ordersApi = {
  // 创建订单
  create: (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  // 获取所有订单（管理员）
  getAll: () => {
    return apiClient.get('/orders');
  },

  // 获取用户订单
  getMyOrders: () => {
    return apiClient.get('/orders/my-orders');
  },

  // 更新订单状态
  update: (id, orderData) => {
    return apiClient.put(`/orders/${id}`, orderData);
  },

  // 取消订单
  cancel: (id) => {
    return apiClient.delete(`/orders/${id}`);
  },

  // 处理支付回调
  handlePaymentCallback: (callbackData) => {
    return apiClient.post('/orders/payment/callback', callbackData);
  },

  // 处理物流回调
  handleLogisticsCallback: (callbackData) => {
    return apiClient.post('/orders/logistics/callback', callbackData);
  }
};

export default ordersApi; 