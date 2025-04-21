import apiClient from './apiClient';

const storeSettingsApi = {
  // 获取商店设置
  get: () => {
    return apiClient.get('/store-settings');
  },

  // 更新商店设置
  update: (data) => {
    return apiClient.put('/store-settings', data);
  },

  // 更新商店Logo
  updateLogo: async (file) => {
    try {
      // 获取文件类型
      const fileType = `.${file.name.split('.').pop()}`;
      
      // 验证文件类型
      if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileType.toLowerCase())) {
        throw new Error('不支援的檔案類型');
      }

      // 获取预签名 URL
      const response = await apiClient.get(`/store-settings/logo/presigned-url?fileType=${fileType}`);
      console.log('預簽名 URL 響應:', response);
      
      // 检查响应数据
      if (!response) {
        console.error('API 響應為空');
        throw new Error('獲取預簽名 URL 失敗：API 響應為空');
      }

      // 直接使用响应数据，因为 API 返回的是直接的对象
      const { uploadUrl, imageUrl, headers } = response;
      console.log('解析後的數據:', { uploadUrl, imageUrl, headers });
      
      // 检查必要字段
      if (!uploadUrl) {
        console.error('缺少 uploadUrl:', response);
        throw new Error('獲取預簽名 URL 失敗：缺少 uploadUrl');
      }
      if (!imageUrl) {
        console.error('缺少 imageUrl:', response);
        throw new Error('獲取預簽名 URL 失敗：缺少 imageUrl');
      }
      if (!headers) {
        console.error('缺少 headers:', response);
        throw new Error('獲取預簽名 URL 失敗：缺少 headers');
      }
      if (!headers['Content-Type']) {
        console.error('缺少 Content-Type header:', headers);
        throw new Error('獲取預簽名 URL 失敗：缺少 Content-Type header');
      }
      if (!headers['x-amz-acl']) {
        console.error('缺少 x-amz-acl header:', headers);
        throw new Error('獲取預簽名 URL 失敗：缺少 x-amz-acl header');
      }
      
      // 使用 fetch API 上传文件到 S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': headers['Content-Type'],
          'x-amz-acl': headers['x-amz-acl']
        },
        body: file
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 上传失败:', errorText);
        throw new Error('上传文件到 S3 失败');
      }
      
      // 更新商店设置中的 logo URL
      return apiClient.put('/store-settings/logo', {
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error('更新 Logo 失败:', error);
      if (error.response) {
        console.error('API 响应:', error.response);
      }
      throw error;
    }
  },

  // 获取Logo预签名URL
  getLogoPresignedUrl: (fileType) => {
    return apiClient.get(`/store-settings/logo/presigned-url?fileType=${fileType}`);
  }
};

export default storeSettingsApi; 