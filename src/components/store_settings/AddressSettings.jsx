import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AddressSettings = ({ settings = {}, onUpdate }) => {
  const [formData, setFormData] = useState({
    address: {
      street: '',
      city: '',
      postalCode: ''
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        address: {
          street: settings.address?.street || '',
          city: settings.address?.city || '',
          postalCode: settings.address?.postalCode || ''
        }
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">地址資訊</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
            地址
          </label>
          <input
            type="text"
            id="address"
            value={formData.address?.street || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: {
                ...formData.address,
                street: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入地址"
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
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">
            郵遞區號
          </label>
          <input
            type="text"
            id="postalCode"
            value={formData.address?.postalCode || ''}
            onChange={(e) => setFormData({
              ...formData,
              address: {
                ...formData.address,
                postalCode: e.target.value
              }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="請輸入郵遞區號"
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

AddressSettings.propTypes = {
  settings: PropTypes.shape({
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      postalCode: PropTypes.string
    })
  }),
  onUpdate: PropTypes.func.isRequired
};

export default AddressSettings; 