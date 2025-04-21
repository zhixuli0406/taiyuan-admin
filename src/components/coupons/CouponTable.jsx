import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import couponsApi from "../../core/api/coupons";

const CouponTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnabled, setFilterEnabled] = useState("all");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await couponsApi.getCoupons();
      if (res && res.coupons) {
        setCoupons(res.coupons);
      } else {
        setCoupons([]);
        console.error("Invalid response structure:", res);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("獲取優惠券列表失敗");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("確定要刪除此優惠券嗎？")) {
      try {
        await couponsApi.deleteCoupon(id);
        toast.success("刪除成功");
        setCoupons(coupons.filter((coupon) => coupon._id !== id));
      } catch (error) {
        console.error("Error deleting coupon:", error);
        toast.error("刪除失敗");
      }
    }
  };

  const handleDisableCoupon = async (id) => {
    try {
      await couponsApi.disableCoupon(id);
      fetchCoupons();
    } catch (error) {
      console.error("Error disabling coupon:", error);
      toast.error("操作失敗");
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEnabled === "all" ||
                         (filterEnabled === "enabled" && coupon.isActive) ||
                         (filterEnabled === "disabled" && !coupon.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="搜索優惠券代碼..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">全部</option>
            <option value="enabled">已啟用</option>
            <option value="disabled">已停用</option>
          </select>
        </div>
        <Link
          to="/coupons/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          新增優惠券
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">優惠券代碼</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">折扣類型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">折扣值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">最低消費</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">最大折扣</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">使用次數</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">有效期限</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredCoupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{coupon.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {coupon.type === "fixed" ? "固定金額" : "百分比"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {coupon.type === "fixed" ? `$${coupon.value}` : `${coupon.value}%`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${coupon.minPurchase || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${coupon.maxDiscount || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {coupon.usedCount || 0} / {coupon.usageLimit || "無限"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {coupon.isActive ? "已啟用" : "已停用"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex space-x-3">
                    <Link
                      to={`/coupons/edit/${coupon._id}`}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDisableCoupon(coupon._id)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {coupon.isActive ? "停用" : "啟用"}
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponTable; 