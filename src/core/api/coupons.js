import apiClient from './apiClient';

const couponsApi = {
  // 获取所有优惠券
  getAll: () => {
    return apiClient.get('/coupons');
  },

  // 创建优惠券
  create: (couponData) => {
    return apiClient.post('/coupons', couponData);
  },

  // 验证优惠券
  validate: (validationData) => {
    return apiClient.post('/coupons/validate', validationData);
  },

  // 禁用优惠券
  disable: (id) => {
    return apiClient.put(`/coupons/${id}/disable`);
  },

  // 删除优惠券
  delete: (id) => {
    return apiClient.delete(`/coupons/${id}`);
  }
};

export default couponsApi; 