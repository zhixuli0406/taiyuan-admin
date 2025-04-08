import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import storeSettingsApi from '../../core/api/storeSettings';
import { toast } from 'react-toastify';

const BasicSettings = ({ settings = {}, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: settings.name || '',
    description: settings.description || '',
    businessHours: settings.businessHours || {
      start: '09:00',
      end: '18:00'
    }
  });
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (settings?.businessHours) {
      // 解析 businessHours 字符串，例如 "9:00 AM - 6:00 PM"
      const [startTime, endTime] = settings.businessHours.split(' - ');
      setFormData({
        ...settings,
        businessHours: {
          start: parseAMPMTo24Hour(startTime),
          end: parseAMPMTo24Hour(endTime)
        }
      });
    } else {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (logo) {
        await storeSettingsApi.updateLogo(logo);
        setLogo(null);
      }
      
      onUpdate();
      toast.success('設置更新成功');
    } catch (error) {
      console.error('更新設置失敗:', error);
      toast.error(error.response?.data?.error || '更新設置失敗');
    }
  };

  const formatTimeToAMPM = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const parseAMPMTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleTimeChange = (time, type) => {
    const formattedTime = parseAMPMTo24Hour(time);
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [type]: formattedTime
      }
    });
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">基本設定</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            商店名稱 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入商店名稱"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            營業時間
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">開始時間</label>
              <TimePicker
                value={formData.businessHours?.start || '09:00'}
                onChange={(value) => handleTimeChange(value, 'start')}
                className="w-full [&>div]:bg-gray-700 [&>div]:border-gray-600 [&>div]:rounded-lg [&>div]:text-white"
                clearIcon={null}
                format="h:mm a"
                disableClock={true}
                locale="en-US"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">結束時間</label>
              <TimePicker
                value={formData.businessHours?.end || '18:00'}
                onChange={(value) => handleTimeChange(value, 'end')}
                className="w-full [&>div]:bg-gray-700 [&>div]:border-gray-600 [&>div]:rounded-lg [&>div]:text-white"
                clearIcon={null}
                format="h:mm a"
                disableClock={true}
                locale="en-US"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            當前營業時間: {formatTimeToAMPM(formData.businessHours?.start)} - {formatTimeToAMPM(formData.businessHours?.end)}
          </div>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-300">
            商店 Logo
          </label>
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setLogo(file);
              }
            }}
            className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
          />
          {settings?.appearance?.logo && (
            <div className="mt-2">
              <img
                src={settings.appearance.logo}
                alt="Current Logo"
                className="h-20 w-auto"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="themeColor" className="block text-sm font-medium text-gray-300 mb-1">
            主題顏色
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              id="themeColor"
              value={formData.appearance?.themeColor || '#ffffff'}
              onChange={(e) => setFormData({
                ...formData,
                appearance: {
                  ...formData.appearance,
                  themeColor: e.target.value
                }
              })}
              className="h-10 w-20 rounded-lg border border-gray-600 cursor-pointer"
            />
            <span className="text-gray-300 font-mono">{formData.appearance?.themeColor || '#ffffff'}</span>
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
    name: PropTypes.string,
    businessHours: PropTypes.string,
    appearance: PropTypes.shape({
      logo: PropTypes.string,
      themeColor: PropTypes.string
    })
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default BasicSettings; 