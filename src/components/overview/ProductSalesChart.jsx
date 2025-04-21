import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductSalesChart = ({ productData }) => {
  if (!productData) return null;

  const chartData = {
    labels: productData.map(item => item.productName),
    datasets: [
      {
        label: "銷售數量",
        data: productData.map(item => item.quantity),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
      },
      {
        label: "銷售金額",
        data: productData.map(item => item.revenue),
        backgroundColor: "rgba(139, 92, 246, 0.8)",
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
        text: "產品銷售排行",
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

ProductSalesChart.propTypes = {
  productData: PropTypes.arrayOf(
    PropTypes.shape({
      productName: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      revenue: PropTypes.number.isRequired,
    })
  ),
};

export default ProductSalesChart; 