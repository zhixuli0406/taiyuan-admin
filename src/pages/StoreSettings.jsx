import { useState, useEffect } from 'react';
import Header from '../components/common_components/Header';
import storeSettingsApi from '../core/api/storeSettings';
import carouselsApi from '../core/api/carousels';
import BasicSettings from '../components/store_settings/BasicSettings';
import ContactSettings from '../components/store_settings/ContactSettings';
import AddressSettings from '../components/store_settings/AddressSettings';
import SocialSettings from '../components/store_settings/SocialSettings';
import CarouselSettings from '../components/store_settings/CarouselSettings.jsx';
import { toast } from 'react-hot-toast';

const initialStoreSettings = {
  storeName: '',
  contact: {
    phone: '',
    email: ''
  },
  address: {
    addressLine: '',
    city: '',
    country: ''
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    x: '',
    line: ''
  },
  businessHours: {
    openTime: '',
    closeTime: ''
  },
  branding: {
    logoUrl: '',
    primaryColor: '#ffffff'
  },
  description: '',
};

const parseAMPMTo24Hour = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const timePart = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!timePart) return '';

  let [, hours, minutes, period] = timePart;
  hours = parseInt(hours, 10);
  minutes = minutes.padStart(2, '0');

  if (period) {
      period = period.toUpperCase();
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const StoreSettings = () => {
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
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
    } catch (err) {
      setError('獲取數據失敗，請稍後再試');
      console.error('獲取數據失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const response = await storeSettingsApi.get();
      console.log('API 响应:', response);
      if (response) {
        let parsedBusinessHoursObject = { openTime: '', closeTime: '' };
        let businessHoursForState = response.businessHours || '';

        if (typeof response.businessHours === 'string' && response.businessHours.includes('-')) {
            const [startStr, endStr] = response.businessHours.split(' - ');
            parsedBusinessHoursObject.openTime = parseAMPMTo24Hour(startStr.trim());
            parsedBusinessHoursObject.closeTime = parseAMPMTo24Hour(endStr.trim());
            businessHoursForState = parsedBusinessHoursObject;
        } else if (typeof response.businessHours === 'object' && response.businessHours !== null) {
            parsedBusinessHoursObject = {
                openTime: response.businessHours.openTime || '',
                closeTime: response.businessHours.closeTime || ''
            };
            businessHoursForState = parsedBusinessHoursObject;
        }

        const updatedSettings = {
          storeName: response.storeName || response.name || '',
          description: response.description || '',
          contact: {
            ...initialStoreSettings.contact,
            ...(response.contact || {}),
          },
          address: {
            ...(response.address || {}),
            addressLine: response.address?.addressLine || '',
            city: response.address?.city || '',
            country: response.address?.country || '',
          },
          socialMedia: {
            ...initialStoreSettings.socialMedia,
            ...(response.socialMedia || {}),
            facebook: response.socialMedia?.facebook || response.socialLinks?.facebook || '',
            instagram: response.socialMedia?.instagram || response.socialLinks?.instagram || '',
            twitter: response.socialMedia?.twitter || '',
          },
          businessHours: businessHoursForState,
          branding: {
            ...initialStoreSettings.branding,
            ...(response.branding || {}),
            logoUrl: response.branding?.logoUrl || response.appearance?.logo || '',
            primaryColor: response.branding?.primaryColor || response.appearance?.themeColor || '#ffffff'
          }
        };
        console.log('更新后的设置 (mapped):', updatedSettings);
        setStoreSettings(updatedSettings);
      } else {
         console.warn('API 未返回有效的商店設定，使用初始值');
         setStoreSettings(initialStoreSettings);
      }
    } catch (err) {
      console.error('獲取商店設定失敗:', err);
      throw err;
    }
  };

  const fetchCarousels = async () => {
    try {
      const response = await carouselsApi.getAll();
      if (response && Array.isArray(response.carousels)) {
        setCarousels(response.carousels);
      } else {
        console.warn('API 未返回有效的輪播圖數據');
        setCarousels([]);
      }
    } catch (err) {
      console.error('獲取輪播圖失敗:', err);
      throw err;
    }
  };

  const handleStoreSettingsUpdate = async (updatedSettingsFromChild) => {
    try {
      const apiPayload = {
         storeName: updatedSettingsFromChild.storeName,
         contact: updatedSettingsFromChild.contact,
         address: {
            addressLine: updatedSettingsFromChild.address?.addressLine,
            city: updatedSettingsFromChild.address?.city,
            country: updatedSettingsFromChild.address?.country,
            postalCode: updatedSettingsFromChild.address?.postalCode,
            district: updatedSettingsFromChild.address?.district,
         },
         socialLinks: {
            facebook: updatedSettingsFromChild.socialLinks?.facebook,
            instagram: updatedSettingsFromChild.socialLinks?.instagram,
            x: updatedSettingsFromChild.socialLinks?.x,
            line: updatedSettingsFromChild.socialLinks?.line,
         },
         businessHours: {
            openTime: updatedSettingsFromChild.businessHours?.openTime,
            closeTime: updatedSettingsFromChild.businessHours?.closeTime,
         },
         branding: {
            logoUrl: updatedSettingsFromChild.branding?.logoUrl,
            primaryColor: updatedSettingsFromChild.branding?.primaryColor,
         },
         description: updatedSettingsFromChild.description,
      };

      await storeSettingsApi.update(apiPayload);
      setStoreSettings(updatedSettingsFromChild);
      setError(null);
      toast.success('商店設定更新成功');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '更新商店設定失敗';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('更新商店設定失敗:', err);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('請上傳 JPG, PNG, 或 GIF 格式的圖片');
      setError('不支援的圖片格式');
      return;
    }

    setError(null); 
    setLoading(true); 

    try {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const presignedResponse = await storeSettingsApi.getLogoPresignedUrl(fileExtension);
      const { uploadUrl, imageUrl, headers } = presignedResponse;

      if (!uploadUrl || !imageUrl || !headers) {
        throw new Error('獲取預簽名 URL 失敗');
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 上傳失敗:', errorText);
        throw new Error(`上傳 Logo 到 S3 失敗`);
      }

      await storeSettingsApi.updateLogoUrl(imageUrl);
      await fetchStoreSettings(); 
      toast.success('Logo 上傳成功');

    } catch (err) {
      const errorMsg = err.message || '上傳 Logo 失敗';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('上傳 Logo 失敗:', err);
    } finally {
       setLoading(false); 
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