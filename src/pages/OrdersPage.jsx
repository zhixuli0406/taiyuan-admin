import { motion } from 'framer-motion'
import { CheckCircle, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import Header from '../components/common_components/Header'
import StatCards from '../components/common_components/StatCards';
import ordersApi from '../core/api/orders';

import DailyOrdersChart from "../components/orders/DailyOrdersChart"
import StatusDistributionChart from '../components/orders/StatusDistributionChart'
import OrdersTable from '../components/orders/OrdersTable'

const OrdersPage = () => {
    const [orderStats, setOrderStats] = useState({
        totalOrders: "0",
        pendingOrders: "0",
        completedOrders: "0",
        totalRevenue: "0"
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersApi.getAll();
                const { statistics } = response;
                
                setOrderStats({
                    totalOrders: (statistics.totalOrders || 0).toString(),
                    pendingOrders: (statistics.pendingOrders || 0).toString(),
                    completedOrders: (statistics.completedOrders || 0).toString(),
                    totalRevenue: `$${(statistics.totalRevenue || 0).toLocaleString()}`
                });
            } catch (error) {
                console.error('獲取訂單數據失敗:', error);
                toast.error(error.response?.data?.message || '獲取訂單數據失敗');
                if (error.response?.status === 401) {
                    localStorage.clear();
                    window.location.href = "/";
                }
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="訂單管理" />
            
            {/* 統計數據 */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards name="總訂單數" icon={ShoppingBag} value={orderStats.totalOrders} color="#6366f1" />
                    <StatCards name="待處理訂單" icon={Clock} value={orderStats.pendingOrders} color="#10b981" />
                    <StatCards name="已完成訂單" icon={CheckCircle} value={orderStats.completedOrders} color="#f59e0b" />
                    <StatCards name="總營收" icon={DollarSign} value={orderStats.totalRevenue} color="#ef4444" />
                </motion.div>

                {/* 每日訂單和訂單狀態分佈圖表 */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7'>
                    <DailyOrdersChart />
                    <StatusDistributionChart />
                </div>

                {/* 訂單表格 */}
                <OrdersTable/>
            </main>
        </div>
    )
}

export default OrdersPage