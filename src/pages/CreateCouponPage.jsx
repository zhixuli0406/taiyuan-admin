import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common_components/Header";
import { toast } from "react-toastify";
import axios from "axios";

const CreateCouponPage = () => {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState({
    title: "",
    percent: 0,
    code: "",
    due_date: "",
    is_enabled: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/v2/api/${process.env.REACT_APP_API_PATH}/admin/coupon`, {
        data: coupon,
      });
      if (res.data.success) {
        toast.success("創建成功");
        navigate("/coupons");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("創建失敗");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCoupon((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="創建優惠券" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">優惠券名稱</label>
                <input
                  type="text"
                  name="title"
                  value={coupon.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">折扣百分比</label>
                <input
                  type="number"
                  name="percent"
                  value={coupon.percent}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">優惠碼</label>
                <input
                  type="text"
                  name="code"
                  value={coupon.code}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">到期日</label>
                <input
                  type="date"
                  name="due_date"
                  value={coupon.due_date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_enabled"
                  checked={coupon.is_enabled === 1}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-300">啟用優惠券</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/coupons")}
                className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                創建
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateCouponPage; 