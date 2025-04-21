import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SaleOverviewChart = ({ salesData }) => {
  if (!salesData) return null;

  const chartData = {
    labels: salesData.map(item => new Date(item._id).toLocaleDateString()),
    datasets: [
      {
        label: "每日收入",
        data: salesData.map(item => item.dailyRevenue),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.4,
      },
      {
        label: "每日訂單數",
        data: salesData.map(item => item.dailyOrders),
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "銷售概覽",
        color: "white",
      },
    },
    scales: {
      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};

SaleOverviewChart.propTypes = {
  salesData: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      dailyRevenue: PropTypes.number.isRequired,
      dailyOrders: PropTypes.number.isRequired,
    })
  ),
};

export default SaleOverviewChart;