import { useEffect, useState } from "react";
import Header from "../components/common_components/Header";
import StatCards from "../components/common_components/StatCards";
import SaleOverviewChart from "../components/overview/SaleOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";
import TopProductsList from "../components/overview/TopProductsList";
import { motion } from "framer-motion";
import { BarChart2, ShoppingBag, Users, Zap, Download, DollarSign } from "lucide-react";
import axios from "axios";

const OverviewPage = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesByCategoryData, setSalesByCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        overviewResponse,
        salesResponse,
        statusResponse,
        topProductsResponse,
        salesByCategoryResponse,
      ] = await Promise.all([
        axios.get("/analytics/overview"),
        axios.get("/analytics/sales"),
        axios.get("/analytics/status"),
        axios.get("/analytics/top-products", { params: { limit: 5 } }),
        axios.get("/analytics/sales-by-category"),
      ]);

      setOverviewData(overviewResponse.data);
      setSalesData(Array.isArray(salesResponse.data) ? salesResponse.data : []);
      setStatusData(Array.isArray(statusResponse.data) ? statusResponse.data : []);
      setTopProducts(Array.isArray(topProductsResponse.data) ? topProductsResponse.data : []);
      setSalesByCategoryData(Array.isArray(salesByCategoryResponse.data) ? salesByCategoryResponse.data : []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setOverviewData(null);
      setSalesData([]);
      setStatusData([]);
      setTopProducts([]);
      setSalesByCategoryData([]);
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get("/analytics/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `銷售數據_總覽.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
        <Header title="總覽" />
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900 text-white">
      <Header title="總覽" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex justify-end items-center">
        <button
          onClick={handleExportData}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <Download className="w-5 h-5" />
          <span>匯出數據</span>
        </button>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
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
            name="平均訂單金額"
            icon={DollarSign}
            value={`$${overviewData?.averageOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
            color="#10b981"
          />
          <StatCards
            name="售出產品總數"
            icon={ShoppingBag}
            value={overviewData?.totalProductsSold?.toLocaleString() || 0}
            color="#ec4899"
          />
          <StatCards
            name="轉換率"
            icon={BarChart2}
            value={`${overviewData?.totalProductsSold ? ((overviewData?.totalOrders / overviewData?.totalProductsSold) * 100).toFixed(1) : 0}%`}
            color="#f59e0b"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SaleOverviewChart salesData={salesData} />
          </div>
          <SalesChannelChart statusData={statusData} />
          <CategoryDistributionChart salesByCategoryData={salesByCategoryData} />
          <div className="lg:col-span-1">
            <TopProductsList topProducts={topProducts} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
