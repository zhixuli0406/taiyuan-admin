import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Search, X } from 'lucide-react';

const OrdersTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatedStatus, setUpdatedStatus] = useState("");
    const itemsPerPage = 6;

    useEffect(() => {
        // 獲取訂單列表
        fetch('/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data.orders);
                setFilteredOrders(data.orders);
            })
            .catch(err => console.error('獲取訂單列表失敗:', err));
    }, []);

    // 處理搜尋
    const SearchHandler = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = orders.filter(order =>
            order.user.email.toLowerCase().includes(term)
        );
        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    // 分頁
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const getCurrentPageOrders = () => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    };

    // 打開彈窗並設置選中的訂單
    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setUpdatedStatus(order.status);
        setShowModal(true);
    };

    // 更新訂單狀態
    const handleSaveStatus = () => {
        if (!selectedOrder) return;

        fetch(`/orders/${selectedOrder._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: updatedStatus })
        })
            .then(res => res.json())
            .then(() => {
                setFilteredOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === selectedOrder._id ? { ...order, status: updatedStatus } : order
                    )
                );
                setShowModal(false);
            })
            .catch(err => console.error('更新訂單狀態失敗:', err));
    };

    // 訂單狀態中文對照
    const statusMap = {
        'Pending': '待處理',
        'Processing': '處理中',
        'Shipped': '已出貨',
        'Completed': '已完成',
        'Cancelled': '已取消'
    };

    // 狀態樣式對照
    const statusStyles = {
        'Pending': 'bg-red-700 text-red-100',
        'Processing': 'bg-yellow-700 text-yellow-100',
        'Shipped': 'bg-blue-700 text-blue-100',
        'Completed': 'bg-green-700 text-green-100',
        'Cancelled': 'bg-gray-700 text-gray-100'
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            {/* 標題和搜尋 */}
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>訂單列表</h2>

                <div className='relative flex items-center'>
                    <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
                    <input
                        type="text"
                        placeholder='搜尋訂單...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={SearchHandler}
                        value={searchTerm}
                    />
                </div>
            </div>

            {/* 表格 */}
            <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
                <table className='min-w-full divide-y divide-gray-400'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>訂單編號</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>客戶信箱</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>總金額</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>狀態</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>付款方式</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>配送方式</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>操作</th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-500'>
                        {getCurrentPageOrders().map((order) => (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.1, delay: 0.2 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm font-semibold text-gray-100 tracking-wider'>{order._id}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{order.user.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>${order.totalAmount.toLocaleString()}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className={`px-3 inline-flex rounded-full text-xs leading-5 font-semibold ${statusStyles[order.status]}`}>
                                        {statusMap[order.status]}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{order.payment?.PaymentType || '未付款'}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>
                                        {order.shippingMethod === 'CVS' ? '超商取貨' : '宅配'}
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <button onClick={() => handleOpenModal(order)}>
                                        <Eye className='text-blue-500 cursor-pointer' size={20} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 訂單詳情彈窗 */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <motion.div
                        className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-100 mb-5 tracking-wider">
                                更新訂單狀態
                            </h1>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-sm text-gray-300">客戶信箱</label>
                                    <div className="text-lg font-normal mb-4 px-4 py-2 bg-gray-700 text-white rounded-md">
                                        {selectedOrder.user.email}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300">訂單金額</label>
                                    <div className="text-lg font-normal mb-4 px-4 py-2 bg-gray-700 text-white rounded-md">
                                        ${selectedOrder.totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1">
                                <label className="text-sm text-gray-300">訂單狀態</label>
                                <select
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md"
                                    value={updatedStatus}
                                    onChange={(e) => setUpdatedStatus(e.target.value)}
                                >
                                    <option value="Pending">待處理</option>
                                    <option value="Processing">處理中</option>
                                    <option value="Shipped">已出貨</option>
                                    <option value="Completed">已完成</option>
                                    <option value="Cancelled">已取消</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-5 space-x-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md"
                            >
                                <X size={22} />
                            </button>
                            <button
                                onClick={handleSaveStatus}
                                className="bg-blue-600 hover:bg-blue-800 text-white text-md px-3 py-3 rounded-md w-32"
                            >
                                儲存變更
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 分頁控制 */}
            <div className='flex flex-col md:flex-row justify-between mt-4 space-x-2 items-center'>
                <div className='flex items-center'>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === 1 ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className='mx-2 text-sm font-medium text-gray-100'>第 {currentPage} 頁，共 {Math.ceil(filteredOrders.length / itemsPerPage)} 頁</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === Math.ceil(filteredOrders.length / itemsPerPage) ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>總訂單數: {filteredOrders.length}</div>
            </div>
        </motion.div>
    );
};

export default OrdersTable;
