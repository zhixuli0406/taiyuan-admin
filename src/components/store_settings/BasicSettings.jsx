import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const BasicSettings = ({ settings = {}, onUpdate, onLogoUpload }) => {
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    businessHours: { openTime: '', closeTime: '' },
    branding: { primaryColor: '#ffffff' }
  });
  const [logoFile, setLogoFile] = useState(null);

  const getSetting = useCallback((path, defaultValue = '') => {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined && acc[key] !== null) ? acc[key] : defaultValue, settings);
  }, [settings]);

  useEffect(() => {
    console.log('BasicSettings received settings:', settings);
    setFormData({
      storeName: getSetting('storeName'),
      description: getSetting('description', ''),
      businessHours: {
        openTime: getSetting('businessHours.openTime', '09:00'),
        closeTime: getSetting('businessHours.closeTime', '18:00')
      },
      branding: {
        primaryColor: getSetting('branding.primaryColor', '#ffffff')
      }
    });
    setLogoFile(null);
  }, [settings, getSetting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    setFormData(prev => {
      let current = prev;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return { ...prev };
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (logoFile) {
      try {
        await onLogoUpload(logoFile);
        toast.success('Logo 上傳請求已送出');
      } catch (error) {
        console.error('Logo upload trigger failed in BasicSettings:', error);
        return;
      }
    }

    try {
      const updatePayload = {
        ...settings,
        storeName: formData.storeName,
        description: formData.description,
        businessHours: {
          openTime: formData.businessHours.openTime,
          closeTime: formData.businessHours.closeTime,
        },
        branding: {
          ...settings.branding,
          primaryColor: formData.branding.primaryColor,
        }
      };
      await onUpdate(updatePayload);
      toast.success('基本設定更新成功');
    } catch (error) {
      console.error('基本設定更新失敗:', error);
      toast.error('基本設定更新失敗');
    }
  };

  const formatDisplayTime = (time) => {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return '無效時間';
    return time;
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">基本設定</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-300 mb-1">
            商店名稱 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="storeName"
            name="storeName"
            required
            value={formData.storeName || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入商店名稱"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            商店描述
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入商店描述"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            營業時間 (24小時制 HH:MM)
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="businessHours.openTime" className="block text-xs text-gray-400 mb-1">開始時間</label>
              <input
                type="time"
                id="businessHours.openTime"
                name="businessHours.openTime"
                value={formData.businessHours.openTime || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="HH:MM"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="businessHours.closeTime" className="block text-xs text-gray-400 mb-1">結束時間</label>
              <input
                type="time"
                id="businessHours.closeTime"
                name="businessHours.closeTime"
                value={formData.businessHours.closeTime || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="HH:MM"
                required
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            當前設定: {formatDisplayTime(formData.businessHours.openTime)} - {formatDisplayTime(formData.businessHours.closeTime)}
          </div>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-300">
            商店 Logo (上傳新圖片以替換)
          </label>
          <input
            type="file"
            id="logo"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleLogoChange}
            className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
          />
          {getSetting('branding.logoUrl') && !logoFile && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">當前 Logo:</p>
              <img
                src={getSetting('branding.logoUrl')}
                alt="Current Logo"
                className="h-20 w-auto bg-gray-600 p-1 rounded"
              />
            </div>
          )}
          {logoFile && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">預覽新 Logo:</p>
              <img
                src={URL.createObjectURL(logoFile)}
                alt="New Logo Preview"
                className="h-20 w-auto bg-gray-600 p-1 rounded"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="branding.primaryColor" className="block text-sm font-medium text-gray-300 mb-1">
            主題顏色
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              id="branding.primaryColor"
              name="branding.primaryColor"
              value={formData.branding.primaryColor || '#ffffff'}
              onChange={handleInputChange}
              className="h-10 w-20 rounded-lg border border-gray-600 cursor-pointer p-1 bg-gray-700"
            />
            <span className="text-gray-300 font-mono">{formData.branding.primaryColor || '#ffffff'}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            保存設定
          </button>
        </div>
      </form>
    </div>
  );
};

BasicSettings.propTypes = {
  settings: PropTypes.shape({
    storeName: PropTypes.string,
    description: PropTypes.string,
    businessHours: PropTypes.shape({
      openTime: PropTypes.string,
      closeTime: PropTypes.string,
    }),
    branding: PropTypes.shape({
      logoUrl: PropTypes.string,
      primaryColor: PropTypes.string
    })
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onLogoUpload: PropTypes.func.isRequired
};

export default BasicSettings; 