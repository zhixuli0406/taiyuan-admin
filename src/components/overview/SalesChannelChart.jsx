import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const SalesChannelChart = ({ statusData }) => {
  if (!statusData) return null;

  const chartData = {
    labels: statusData.map(item => item._id),
    datasets: [
      {
        data: statusData.map(item => item.count),
        backgroundColor: [
          "rgba(99, 102, 241, 0.5)",
          "rgba(139, 92, 246, 0.5)",
          "rgba(236, 72, 153, 0.5)",
          "rgba(16, 185, 129, 0.5)",
          "rgba(245, 158, 11, 0.5)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(139, 92, 246)",
          "rgb(236, 72, 153)",
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "white",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Order Status Distribution",
        color: "white",
      },
    },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

SalesChannelChart.propTypes = {
  statusData: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ),
};

export default SalesChannelChart;