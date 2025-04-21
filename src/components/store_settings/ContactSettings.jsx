import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const ContactSettings = ({ settings = {}, onUpdate }) => {
  const [formData, setFormData] = useState({
    phone: '',
    email: ''
  });

  const getSetting = useCallback((key, defaultValue = '') => {
    return settings?.contact?.[key] ?? defaultValue;
  }, [settings?.contact]);

  useEffect(() => {
    setFormData({
      phone: getSetting('phone'),
      email: getSetting('email')
    });
  }, [settings, getSetting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatePayload = {
        ...settings,
        contact: {
          ...settings.contact,
          phone: formData.phone,
          email: formData.email,
        }
      };
      await onUpdate(updatePayload);
      toast.success('聯絡資訊更新成功');
    } catch (error) {
      console.error('更新聯絡資訊失敗:', error);
      toast.error('更新聯絡資訊失敗');
    }
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">聯絡資訊</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            電話
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入電話號碼"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            電子郵件
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入電子郵件"
          />
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

ContactSettings.propTypes = {
  settings: PropTypes.shape({
    contact: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string
    })
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ContactSettings; 