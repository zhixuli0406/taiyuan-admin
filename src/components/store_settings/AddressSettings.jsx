import React, { useState, useEffect } from 'react';

const AddressSettings = ({ settings, onUpdate }) => {
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
      <h2 className="text-lg font-medium text-white mb-6">地址</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
            國家
          </label>
          <input
            type="text"
            id="country"
            value={formData.address?.country || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: {
                ...formData.address,
                country: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入國家"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
            城市
          </label>
          <input
            type="text"
            id="city"
            value={formData.address?.city || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: {
                ...formData.address,
                city: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入城市"
          />
        </div>

        <div>
          <label htmlFor="addressLine" className="block text-sm font-medium text-gray-300 mb-1">
            詳細地址
          </label>
          <input
            type="text"
            id="addressLine"
            value={formData.address?.addressLine || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: {
                ...formData.address,
                addressLine: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入詳細地址"
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

export default AddressSettings; 