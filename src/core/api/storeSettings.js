import apiClient from './apiClient';

const storeSettingsApi = {
  // 获取商店设置
  get: () => {
    return apiClient.get('/store-settings');
  },

  // 更新商店设置
  update: (settings) => {
    return apiClient.put('/store-settings', settings);
  },

  // 更新商店Logo
  updateLogo: (logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return apiClient.put('/store-settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default storeSettingsApi; 