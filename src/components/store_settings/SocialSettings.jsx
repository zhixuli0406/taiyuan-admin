import React, { useState, useEffect } from 'react';

const SocialSettings = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">社群連結</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="facebook" className="block text-sm font-medium text-gray-300 mb-1">
            Facebook
          </label>
          <input
            type="url"
            id="facebook"
            value={formData.socialLinks?.facebook || ''}
            onChange={(e) => setFormData({
              ...formData,
              socialLinks: {
                ...formData.socialLinks,
                facebook: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入 Facebook 連結"
          />
        </div>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1">
            Twitter
          </label>
          <input
            type="url"
            id="twitter"
            value={formData.socialLinks?.twitter || ''}
            onChange={(e) => setFormData({
              ...formData,
              socialLinks: {
                ...formData.socialLinks,
                twitter: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入 Twitter 連結"
          />
        </div>

        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-300 mb-1">
            Instagram
          </label>
          <input
            type="url"
            id="instagram"
            value={formData.socialLinks?.instagram || ''}
            onChange={(e) => setFormData({
              ...formData,
              socialLinks: {
                ...formData.socialLinks,
                instagram: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入 Instagram 連結"
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

export default SocialSettings; 