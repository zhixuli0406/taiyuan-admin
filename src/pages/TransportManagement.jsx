import { useState, useEffect } from 'react';
import Header from "../components/common_components/Header";
import transportApi from '../core/api/transport';
import { toast } from 'react-toastify';

const TransportManagement = () => {
  const [transports, setTransports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransport, setCurrentTransport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fee: 0,
    estimatedDays: 0,
    isActive: true,
  });

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('請先登入');
      window.location.href = '/';
      return;
    }
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      const response = await transportApi.getAll();
      setTransports(response.transports || []);
    } catch (error) {
      console.error('Error fetching transports:', error);
      toast.error(error.response?.data?.message || '獲取運輸方式列表失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const handleOpenModal = (transport = null) => {
    if (transport) {
      console.log('Opening modal with transport:', transport);
      setCurrentTransport(transport);
      setFormData({
        name: transport.name,
        description: transport.description,
        fee: transport.fee,
        estimatedDays: transport.estimatedDays,
        isActive: transport.isActive,
      });
    } else {
      console.log('Opening modal for new transport');
      setCurrentTransport(null);
      setFormData({
        name: '',
        description: '',
        fee: 0,
        estimatedDays: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTransport(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleSubmit = async () => {
    try {
      // 验证必填字段
      if (!formData.name || !formData.fee) {
        toast.error('請填寫必要欄位（名稱和費用）');
        return;
      }

      // 确保数值字段为数字类型
      const submitData = {
        ...formData,
        fee: Number(formData.fee),
        estimatedDays: Number(formData.estimatedDays) || 0
      };

      console.log('Submitting transport data:', { currentTransport, submitData });

      if (currentTransport && currentTransport._id) {
        await transportApi.update(currentTransport._id, submitData);
        toast.success('運輸方式更新成功');
      } else {
        await transportApi.create(submitData);
        toast.success('運輸方式創建成功');
      }
      fetchTransports();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving transport:', error);
      toast.error(error.response?.data?.message || '保存運輸方式失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('确定要删除这个运输方式吗？')) {
      try {
        await transportApi.delete(_id);
        fetchTransports();
      } catch (error) {
        console.error('Error deleting transport:', error);
      }
    }
  };

  const handleStatusChange = async (_id, currentStatus) => {
    try {
      await transportApi.updateTransportStatus(_id, !currentStatus);
      fetchTransports();
    } catch (error) {
      console.error('Error updating transport status:', error);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="運輸方式" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">運輸方式列表</h2>
          <button
            onClick={() => handleOpenModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            新增運輸方式
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">運費</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">預計送達天數</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {transports.map((transport) => (
                <tr key={transport._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transport.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transport.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transport.fee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{transport.estimatedDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={transport.isActive}
                        onChange={() => handleStatusChange(transport._id, transport.isActive)}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={() => handleOpenModal(transport)}
                      className="text-purple-400 hover:text-purple-300 mr-4"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(transport._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-100 mb-4">
              {currentTransport ? '編輯運輸方式' : '新增運輸方式'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">名稱</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">描述</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">運費</label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500 focus:ring-purple-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">預計送達天數</label>
                <input
                  type="number"
                  name="estimatedDays"
                  value={formData.estimatedDays}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500 focus:ring-purple-500"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                />
                <label className="ml-2 block text-sm text-gray-300">啟用</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportManagement; 