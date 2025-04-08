import { useState, useEffect } from 'react';
import Header from '../components/common_components/Header';
import storeSettingsApi from '../core/api/storeSettings';
import carouselsApi from '../core/api/carousels';
import BasicSettings from '../components/store_settings/BasicSettings';
import ContactSettings from '../components/store_settings/ContactSettings';
import AddressSettings from '../components/store_settings/AddressSettings';
import SocialSettings from '../components/store_settings/SocialSettings';
import CarouselSettings from '../components/store_settings/CarouselSettings.jsx';

const StoreSettings = () => {
  const [storeSettings, setStoreSettings] = useState({});
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStoreSettings(), fetchCarousels()]);
    } catch {
      setError('獲取數據失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const response = await storeSettingsApi.get();
      setStoreSettings(response.settings || {});
    } catch {
      setError('獲取商店設定失敗');
      throw new Error('獲取商店設定失敗');
    }
  };

  const fetchCarousels = async () => {
    try {
      const response = await carouselsApi.getAll();
      setCarousels(response.carousels);
    } catch {
      setError('獲取輪播圖失敗');
      throw new Error('獲取輪播圖失敗');
    }
  };

  const handleStoreSettingsUpdate = async (updatedSettings) => {
    try {
      await storeSettingsApi.update(updatedSettings);
      setStoreSettings(updatedSettings);
      setError(null);
    } catch {
      setError('更新商店設定失敗');
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('請上傳圖片文件');
      return;
    }

    try {
      await storeSettingsApi.updateLogo(file);
      fetchStoreSettings();
      setError(null);
    } catch {
      setError('上傳 Logo 失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
        <Header title="商店設定" />
        <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
          <div className="text-center text-gray-400">載入中...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="商店設定" />

      <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-900 text-red-200 rounded-md">
            {error}
          </div>
        )}

        <BasicSettings
          settings={storeSettings}
          onUpdate={handleStoreSettingsUpdate}
          onLogoUpload={handleLogoUpload}
        />

        <ContactSettings
          settings={storeSettings}
          onUpdate={handleStoreSettingsUpdate}
        />

        <AddressSettings
          settings={storeSettings}
          onUpdate={handleStoreSettingsUpdate}
        />

        <SocialSettings
          settings={storeSettings}
          onUpdate={handleStoreSettingsUpdate}
        />

        <CarouselSettings
          carousels={carousels}
          onUpdate={fetchCarousels}
        />
      </main>
    </div>
  );
};

export default StoreSettings; 