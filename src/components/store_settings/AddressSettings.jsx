import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

// Fetch cities from NLSC API
const fetchCitiesFromNLSC = async () => {
  console.log(`Fetching cities for Taiwan from NLSC API...`);
  try {
    const response = await fetch('https://api.nlsc.gov.tw/other/ListCounty');
    if (!response.ok) {
      throw new Error(`NLSC API error: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    
    // Add root element if not present
    const xmlText = text.trim().startsWith('<?xml') ? text : `<?xml version="1.0" encoding="UTF-8"?>${text}`;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError);
      throw new Error('XML parsing error');
    }
    
    // Parse XML response
    const countyItemsContainer = xmlDoc.getElementsByTagName("countyItems")[0];
    if (!countyItemsContainer) {
      console.error('No countyItems container found');
      throw new Error('Invalid XML structure');
    }
    
    const countyItems = countyItemsContainer.getElementsByTagName("countyItem");
    const cities = Array.from(countyItems).map(item => {
      try {
        const countyName = item.getElementsByTagName("countyname")[0]?.textContent;
        const countyCode = item.getElementsByTagName("countycode01")[0]?.textContent;
        
        if (!countyName || !countyCode) {
          console.warn('Missing data for county item:', item);
          return null;
        }
        
        return {
          name: countyName,
          code: countyCode
        };
      } catch (err) {
        console.warn('Error parsing county item:', item, err);
        return null;
      }
    })
    .filter(item => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));

    console.log('Parsed Taiwan cities:', cities);
    return cities;
  } catch (error) {
    console.error('Error fetching Taiwan cities from NLSC API:', error);
    toast.error('無法載入台灣縣市列表');
    return [];
  }
};

// Fetch towns from NLSC API
const fetchTownsFromNLSC = async (countyCode) => {
  console.log(`Fetching towns for county code ${countyCode} from NLSC API...`);
  try {
    const response = await fetch(`https://api.nlsc.gov.tw/other/ListTown1/${countyCode}`);
    if (!response.ok) {
      throw new Error(`NLSC API error: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    
    // Parse XML response
    const townItems = xmlDoc.getElementsByTagName("townItem");
    const towns = Array.from(townItems).map(item => {
      const townName = item.getElementsByTagName("townname")[0]?.textContent;
      const townCode = item.getElementsByTagName("towncode")[0]?.textContent;
      const townCode2 = item.getElementsByTagName("towncode01")[0]?.textContent;
      
      if (!townName || !townCode) {
        console.warn('Missing data for town item:', item);
        return null;
      }
      
      return {
        name: townName,
        code: townCode,
        code2: townCode2
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));

    console.log('Parsed towns:', towns);
    return towns;
  } catch (error) {
    console.error('Error fetching towns from NLSC API:', error);
    toast.error('無法載入鄉鎮市區列表');
    return [];
  }
};

// Update the component
const AddressSettings = ({ settings = {}, onUpdate }) => {
  // Set country to Taiwan by default
  const [selectedCountry] = useState('台灣');
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      setApiError(null);
      try {
        const cityData = await fetchCitiesFromNLSC();
        setCities(cityData || []);

        // 如果有預設的城市設定，找到對應的城市代碼
        if (settings?.address?.city) {
          const matchingCity = cityData.find(c => c.name === settings.address.city);
          if (matchingCity) {
            setSelectedCity(matchingCity.name);
            setSelectedCityCode(matchingCity.code);
            // 同時設定行政區
            if (settings.address.district) {
              setSelectedDistrict(settings.address.district);
            }
            // 設定詳細地址
            if (settings.address.addressLine) {
              setAddressDetail(settings.address.addressLine);
            }
          }
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        setApiError('無法載入台灣縣市列表');
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [settings?.address?.city]);

  // Fetch districts when selectedCity changes
  useEffect(() => {
    if (!selectedCityCode) return;

    const loadDistricts = async () => {
      setLoadingDistricts(true);
      setApiError(null);
      let initialDetail = '';
      let initialDistrict = '';
      let districtData = [];

      try {
        districtData = await fetchTownsFromNLSC(selectedCityCode);
        setDistricts(districtData || []);

        // 如果有預設的行政區設定，且城市相符
        if (settings?.address?.district && 
            settings.address.city === selectedCity) {
          initialDistrict = settings.address.district;
          // 如果有詳細地址，移除行政區名稱後作為詳細地址
          if (settings.address.addressLine) {
            initialDetail = settings.address.addressLine.replace(initialDistrict, '').trim();
          }
        }

        setSelectedDistrict(initialDistrict);
        setAddressDetail(initialDetail);

      } catch (error) {
        console.error('Error loading districts:', error);
        setApiError(`無法載入 ${selectedCity} 的鄉鎮市區列表`);
        setDistricts([]);
        setAddressDetail('');
        setSelectedDistrict('');
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedCityCode, selectedCity, settings?.address?.district, settings?.address?.addressLine]);

  // --- Event Handlers ---
  const handleCityChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const cityCode = selectedOption.getAttribute('data-code');
    setSelectedCity(e.target.value);
    setSelectedCityCode(cityCode);
    setSelectedDistrict('');
    setDistricts([]);
    setAddressDetail('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const handleDetailChange = (e) => {
    setAddressDetail(e.target.value);
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCountry || !selectedCity || !selectedDistrict || !addressDetail) { 
        toast.error('請選擇縣市、鄉鎮市區並填寫詳細地址');
        return;
    }

    try {
      // Fetch postal code before updating
      const fullAddress = `${selectedCity}${selectedDistrict}${addressDetail}`;
      const postalCodeUrl = `https://zip5.5432.tw/zip5json.py?adrs=${encodeURIComponent(fullAddress)}`;
      
      const response = await fetch(postalCodeUrl);
      if (!response.ok) {
        throw new Error('無法取得郵遞區號');
      }
      
      const postalData = await response.json();
      
      // Check if we got valid postal data
      if (!postalData || (!postalData.zipcode && !postalData.zipcode6)) {
        console.warn('未能取得有效的郵遞區號:', postalData);
      }

      // Create the complete address object
      const addressObject = {
        addressLine: addressDetail,
        city: selectedCity,
        country: selectedCountry,
        district: selectedDistrict,
        postalCode: postalData.zipcode || postalData.zipcode6 || ''
      };

      console.log('更新地址資料:', addressObject);

      // Create the update payload
      const updatedSettings = {
        ...settings,
        address: addressObject
      };
      
      await onUpdate(updatedSettings);
      toast.success('地址資訊更新成功');
    } catch (error) {
      console.error('更新地址資訊失敗:', error);
      toast.error(error.message || '更新地址資訊失敗');
    }
  };

  // --- JSX --- 
  return (
    <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-white mb-6">地址資訊</h2>
      {apiError && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md text-sm">
          {apiError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country Input (Locked to Taiwan) */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
            國家
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value="台灣"
            readOnly
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white opacity-50 cursor-not-allowed"
          />
        </div>

        {/* City Dropdown */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
            縣市 {loadingCities && <span className="text-xs text-blue-400 ml-2">載入中...</span>}
          </label>
          <select
            id="city"
            name="city"
            value={selectedCity}
            onChange={handleCityChange}
            disabled={loadingCities || cities.length === 0}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>-- 請選擇縣市 --</option>
            {cities.map(city => (
              <option key={city.name} value={city.name} data-code={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-300 mb-1">
            鄉鎮市區 {loadingDistricts && <span className="text-xs text-blue-400 ml-2">載入中...</span>}
          </label>
          <select
            id="district"
            name="district"
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedCity || loadingDistricts || districts.length === 0}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>-- 請選擇鄉鎮市區 --</option>
            {districts.map(district => (
              <option key={district.name} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address Detail Input */}
        <div>
          <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-300 mb-1">
            詳細地址 (路/街、巷、弄、號、樓)
          </label>
          <input
            type="text"
            id="addressDetail"
            name="addressDetail"
            value={addressDetail}
            onChange={handleDetailChange}
            disabled={!selectedDistrict} 
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="請輸入詳細地址"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存設定
          </button>
        </div>
      </form>
    </div>
  );
};

// Update PropTypes
AddressSettings.propTypes = {
  settings: PropTypes.shape({
    address: PropTypes.shape({
      addressLine: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string, 
      district: PropTypes.string, 
      postalCode: PropTypes.string 
    })
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default AddressSettings; 