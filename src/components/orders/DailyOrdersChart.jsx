import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DailyOrdersChart = () => {
    const [ordersData, setOrdersData] = useState([]);

    useEffect(() => {
        // 獲取銷售數據
        fetch('/analytics/sales')
            .then(res => res.json())
            .then(data => {
                // 格式化數據
                const formattedData = data.map(item => ({
                    date: new Date(item._id).toLocaleDateString('zh-TW'),
                    訂單數: item.dailyOrders
                }));
                setOrdersData(formattedData);
            })
            .catch(err => console.error('獲取銷售數據失敗:', err));
    }, []);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h2 className='text-xl font-semibold mb-4 text-gray-100'>
                每日訂單統計
            </h2>

            <div className='h-80'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <LineChart data={ordersData}>
                        <CartesianGrid strokeDasharray={'3 3'} stroke='#4b5563' />
                        <XAxis dataKey={"date"} stroke='#9ca3af' />
                        <YAxis stroke='#9ca3af' />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 45, 55, 0.8)",
                                borderColor: "#4b5563"
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                        />
                        <Line
                            type="monotone"
                            dataKey='訂單數'
                            stroke='#6366f1'
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8, strokeWidth: 2 }}
                        />
                        <Legend/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}

export default DailyOrdersChart