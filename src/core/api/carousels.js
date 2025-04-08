import apiClient from './apiClient';

const carouselsApi = {
  getAll: () => {
    return apiClient.get('/carousel');
  },

  create: (carouselData) => {
    return apiClient.post('/carousel', carouselData);
  },

  update: (id, carouselData) => {
    return apiClient.put(`/carousel/${id}`, carouselData);
  },

  delete: (id) => {
    return apiClient.delete(`/carousel/${id}`);
  },

  getPresignedUrl: async (fileType) => {
    try {
      const response = await apiClient.get(`/carousel/presigned-url?fileType=${fileType}`);
      console.log('預簽名 URL 響應:', response);
      
      // 检查响应格式
      if (!response) {
        console.error('響應為空');
        throw new Error('無效的預簽名 URL 響應');
      }

      // 检查必要字段
      const { uploadUrl, imageUrl, headers } = response;
      if (!uploadUrl || !imageUrl) {
        console.error('缺少必要字段:', { uploadUrl, imageUrl });
        throw new Error('無效的預簽名 URL 響應');
      }

      return response;
    } catch (error) {
      console.error('獲取預簽名 URL 失敗:', error);
      throw error;
    }
  }
};

export default carouselsApi; 