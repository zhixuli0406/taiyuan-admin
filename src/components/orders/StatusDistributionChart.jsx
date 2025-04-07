import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#fed766"];

const StatusDistributionChart = () => {
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    // 獲取訂單狀態統計
    fetch('/analytics/status')
      .then(res => res.json())
      .then(data => {
        // 將狀態翻譯為中文
        const statusMap = {
          'Pending': '待處理',
          'Processing': '處理中',
          'Shipped': '已出貨',
          'Delivered': '已送達'
        };
        
        const formattedData = data.map(item => ({
          name: statusMap[item._id] || item._id,
          value: item.count
        }));
        setStatusData(formattedData);
      })
      .catch(err => console.error('獲取狀態統計失敗:', err));
  }, []);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>
        訂單狀態分佈
      </h2>

      <div className='h-80'>
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <PieChart>
            <Pie
              data={statusData}
              cx={"50%"}
              cy={"50%"}
              labelLine={false}
              outerRadius={80}
              fill='#8884d8'
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {statusData.map((item, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4b5563",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default StatusDistributionChart