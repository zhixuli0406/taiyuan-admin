import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";
import { Doughnut, getElementAtEvent } from "react-chartjs-2";
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
  const navigate = useNavigate();
  const chartRef = useRef(null);

  // Return a message if data is not available or empty
  if (!statusData || statusData.length === 0) {
     return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-lg font-semibold mb-4">訂單出貨狀態</h3>
        <p>暫無訂單狀態數據。</p>
      </div>
    );
  }

  // Define shipped and unshipped statuses (adjust based on your actual API status values)
  const shippedStatuses = ["Shipped", "Completed"];
  const unshippedStatuses = ["Pending", "Paid"]; // Add other relevant unshipped statuses if needed

  let shippedCount = 0;
  let unshippedCount = 0;

  statusData.forEach(item => {
    if (shippedStatuses.includes(item._id)) {
      shippedCount += item.count;
    } else if (unshippedStatuses.includes(item._id)) {
      unshippedCount += item.count;
    }
    // Ignore other statuses like 'Cancelled'
  });

  // Return message if no relevant data found after filtering
  if (shippedCount === 0 && unshippedCount === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-lg font-semibold mb-4">訂單出貨狀態</h3>
        <p>無相關出貨狀態數據可顯示。</p>
      </div>
    );
  }

  const chartData = {
    labels: ["已出貨", "未出貨"],
    datasets: [
      {
        data: [shippedCount, unshippedCount],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)", // Emerald for Shipped
          "rgba(245, 158, 11, 0.7)", // Amber for Unshipped
        ],
        borderColor: [
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "white",
          padding: 20,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "訂單出貨狀態", // Updated title
        color: "white",
        padding: {
            bottom: 20
        }
      },
      tooltip: {
        callbacks: {
           label: function(context) {
                let label = context.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed !== null) {
                    // Display count
                    label += `${context.parsed.toLocaleString()} 筆`;
                }
                return label;
            }
        }
      },
      // Consider adding datalabels plugin if you want percentages/counts directly on the chart
      // datalabels: { ... }
    },
  };

  const handleChartClick = (event) => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    const element = getElementAtEvent(chart, event);

    if (element.length > 0) {
      const index = element[0].index;
      const label = chart.data.labels[index];
      let filterStatus = [];

      if (label === "已出貨") {
        filterStatus = shippedStatuses;
      } else if (label === "未出貨") {
        filterStatus = unshippedStatuses;
      }

      if (filterStatus.length > 0) {
        // Navigate to the orders page with the filter status in state
        // The receiving page (/orders) needs to use useLocation() to get this state.
        navigate('/orders', { state: { filterStatus: filterStatus } });
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[400px] flex flex-col justify-center">
      <Doughnut
        ref={chartRef}
        data={chartData}
        options={options}
        onClick={handleChartClick}
      />
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