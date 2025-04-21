import { useEffect, useState } from "react";
import Header from "../components/common_components/Header";
import StatCards from "../components/common_components/StatCards";
import SaleOverviewChart from "../components/overview/SaleOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";
import { motion } from "framer-motion";
import { BarChart2, ShoppingBag, Users, Zap, Download, Calendar } from "lucide-react";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

const OverviewPage = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 獲取總覽數據
      const overviewResponse = await axios.get("/analytics/overview");
      setOverviewData(overviewResponse.data);

      // 獲取銷售數據
      const salesResponse = await axios.get("/analytics/sales", {
        params: {
          start: format(dateRange[0].startDate, "yyyy-MM-dd"),
          end: format(dateRange[0].endDate, "yyyy-MM-dd"),
        },
      });
      setSalesData(Array.isArray(salesResponse.data) ? salesResponse.data : []);

      // 獲取訂單狀態數據
      const statusResponse = await axios.get("/analytics/status");
      setStatusData(Array.isArray(statusResponse.data) ? statusResponse.data : []);

      // 獲取熱銷產品數據
      const topProductsResponse = await axios.get("/analytics/top-products", {
        params: { limit: 5 },
      });
      setTopProducts(Array.isArray(topProductsResponse.data) ? topProductsResponse.data : []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get("/analytics/export", {
        params: {
          start: format(dateRange[0].startDate, "yyyy-MM-dd"),
          end: format(dateRange[0].endDate, "yyyy-MM-dd"),
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `銷售數據_${format(dateRange[0].startDate, "yyyy-MM-dd")}_${format(dateRange[0].endDate, "yyyy-MM-dd")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
        <Header title="總覽" />
        <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          <div className="text-white text-center">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="總覽" />

      {/* 日期選擇器和導出按鈕 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <Calendar className="w-5 h-5" />
            <span>
              {format(dateRange[0].startDate, "yyyy/MM/dd", { locale: zhTW })} -{" "}
              {format(dateRange[0].endDate, "yyyy/MM/dd", { locale: zhTW })}
            </span>
          </button>
          {showDatePicker && (
            <div className="absolute z-50 mt-2">
              <DateRangePicker
                ranges={dateRange}
                onChange={(item) => setDateRange([item.selection])}
                locale={zhTW}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Download className="w-5 h-5" />
          <span>導出數據</span>
        </button>
      </div>

      {/* 統計數據 */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCards
            name="總收入"
            icon={Zap}
            value={`$${overviewData?.totalRevenue?.toLocaleString() || 0}`}
            color="#6366f1"
          />
          <StatCards
            name="總訂單數"
            icon={Users}
            value={overviewData?.totalOrders?.toLocaleString() || 0}
            color="#8b5cf6"
          />
          <StatCards
            name="銷售產品數"
            icon={ShoppingBag}
            value={overviewData?.totalProductsSold?.toLocaleString() || 0}
            color="#ec4899"
          />
          <StatCards
            name="轉換率"
            icon={BarChart2}
            value={`${((overviewData?.totalOrders / overviewData?.totalProductsSold) * 100 || 0).toFixed(1)}%`}
            color="#10b981"
          />
        </motion.div>

        {/* 圖表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SaleOverviewChart salesData={salesData} />
          <CategoryDistributionChart topProducts={topProducts} />
          <SalesChannelChart statusData={statusData} />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
