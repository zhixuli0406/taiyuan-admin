import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const SocialSettings = ({ settings = {}, onUpdate }) => {
  const [formData, setFormData] = useState({
    facebook: '',
    instagram: '',
    x: '',
    line: ''
  });

  const getSetting = useCallback((key, defaultValue = '') => {
    return settings?.socialLinks?.[key] ?? defaultValue;
  }, [settings?.socialLinks]);

  useEffect(() => {
    setFormData({
      facebook: getSetting('facebook'),
      instagram: getSetting('instagram'),
      x: getSetting('x'),
      line: getSetting('line')
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
        socialLinks: {
          ...settings.socialLinks,
          facebook: formData.facebook,
          instagram: formData.instagram,
          x: formData.x,
          line: formData.line
        }
      };

      await onUpdate(updatePayload);
      toast.success('社群媒體設定更新成功');
    } catch (error) {
      console.error('更新社群媒體設定失敗:', error);
      toast.error('更新社群媒體設定失敗');
    }
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">社群媒體</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="facebook" className="block text-sm font-medium text-gray-300 mb-1">
            Facebook 連結
          </label>
          <input
            type="url"
            id="facebook"
            name="facebook"
            value={formData.facebook}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="https://facebook.com/yourpage"
          />
        </div>

        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-1">
            Instagram 連結
          </label>
          <input
            type="url"
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="https://instagram.com/yourprofile"
          />
        </div>

        <div>
          <label htmlFor="x" className="block text-sm font-medium text-gray-300 mb-1">
            X (Twitter) 連結
          </label>
          <input
            type="url"
            id="x"
            name="x"
            value={formData.x}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="https://x.com/yourhandle"
          />
        </div>

        <div>
          <label htmlFor="line" className="block text-sm font-medium text-gray-300 mb-1">
            Line 連結
          </label>
          <input
            type="url"
            id="line"
            name="line"
            value={formData.line}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="https://line.me/yourprofile"
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

SocialSettings.propTypes = {
  settings: PropTypes.shape({
    socialLinks: PropTypes.shape({
      facebook: PropTypes.string,
      instagram: PropTypes.string,
      x: PropTypes.string,
      line: PropTypes.string
    })
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default SocialSettings; 