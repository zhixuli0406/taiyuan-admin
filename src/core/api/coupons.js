import apiClient from "./apiClient";

// 获取所有优惠券
export const getCoupons = async () => {
  try {
    const res = await apiClient.get('/coupons');
    return res.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
};

// 创建优惠券
export const createCoupon = async (couponData) => {
  try {
    const res = await apiClient.post('/coupons', {
      data: couponData,
    });
    return res.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};

// 更新优惠券
export const updateCoupon = async (id, couponData) => {
  try {
    const res = await apiClient.put(`/coupons/${id}`, {
      data: couponData,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
};

// 删除优惠券
export const deleteCoupon = async (id) => {
  try {
    const res = await apiClient.delete(`/coupons/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

// 验证优惠券
export const verifyCoupon = async (code, amount) => {
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
};

// 禁用优惠券
export const disableCoupon = async (id) => {
  try {
    const res = await apiClient.put(`/coupons/${id}/disable`);
    return res.data;
  } catch (error) {
    console.error("Error disabling coupon:", error);
    throw error;
  }
}; 