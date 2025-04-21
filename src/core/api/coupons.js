import apiClient from "./apiClient";

const couponsApi = {
  // 獲取所有優惠券
  getCoupons: async () => {
    try {
      const res = await apiClient.get('/coupons');
      return res;
    } catch (error) {
      console.error("Error fetching coupons:", error);
      throw error;
    }
  },

  // 創建優惠券
  createCoupon: async (couponData) => {
    try {
      const res = await apiClient.post('/coupons', couponData);
      return res;
    } catch (error) {
      console.error("Error creating coupon:", error);
      throw error;
    }
  },

  // 更新優惠券
  updateCoupon: async (id, couponData) => {
    try {
      const res = await apiClient.put(`/coupons/${id}`, {
        data: couponData,
      });
      return res.data;
    } catch (error) {
      console.error("Error updating coupon:", error);
      throw error;
    }
  },

  // 刪除優惠券
  deleteCoupon: async (id) => {
    try {
      const res = await apiClient.delete(`/coupons/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting coupon:", error);
      throw error;
    }
  },

  // 驗證優惠券
  verifyCoupon: async (code, amount) => {
    try {
      const res = await apiClient.post('/coupons/verify', {
        code,
        amount,
      });
      return res.data;
    } catch (error) {
      console.error("Error verifying coupon:", error);
      throw error;
    }
  },

  // 禁用優惠券
  disableCoupon: async (id) => {
    try {
      const res = await apiClient.put(`/coupons/${id}/disable`);
      return res.data;
    } catch (error) {
      console.error("Error disabling coupon:", error);
      throw error;
    }
  },

  // 啟用優惠券
  enableCoupon: async (id) => {
    try {
      const res = await apiClient.put(`/coupons/${id}/enable`);
      return res.data;
    } catch (error) {
      console.error("Error enabling coupon:", error);
      throw error;
    }
  }
};

export default couponsApi; 