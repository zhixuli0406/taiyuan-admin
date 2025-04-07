import apiClient from './apiClient';

const carouselsApi = {
  // 获取所有轮播图
  getAll: () => {
    return apiClient.get('/carousel');
  },

  // 创建轮播图
  create: (carouselData) => {
    return apiClient.post('/carousel', carouselData);
  },

  // 更新轮播图
  update: (id, carouselData) => {
    return apiClient.put(`/carousel/${id}`, carouselData);
  },

  // 删除轮播图
  delete: (id) => {
    return apiClient.delete(`/carousel/${id}`);
  }
};

export default carouselsApi; 