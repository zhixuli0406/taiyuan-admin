import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const generateBgColors = (count) => {
  const colors = [
    "rgba(99, 102, 241, 0.7)",
    "rgba(139, 92, 246, 0.7)",
    "rgba(236, 72, 153, 0.7)",
    "rgba(16, 185, 129, 0.7)",
    "rgba(245, 158, 11, 0.7)",
    "rgba(239, 68, 68, 0.7)",
    "rgba(59, 130, 246, 0.7)",
    "rgba(34, 197, 94, 0.7)",
  ];
  let result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

const CategoryDistributionChart = ({ salesByCategoryData }) => {
  if (!salesByCategoryData || salesByCategoryData.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-lg font-semibold mb-4">分類銷售分佈</h3>
        <p>暫無分類銷售數據。</p>
      </div>
    );
  }

  const chartData = {
    labels: salesByCategoryData.map(item => item._id || "未分類"),
    datasets: [
      {
        label: "銷售額",
        data: salesByCategoryData.map(item => item.totalRevenue),
        backgroundColor: generateBgColors(salesByCategoryData.length),
        borderColor: generateBgColors(salesByCategoryData.length).map(color => color.replace('0.7', '1')),
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
          padding: 15,
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "分類銷售額佔比",
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
                    label += new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(context.parsed);
                }
                return label;
            }
        }
      },
      datalabels: {
        formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.map(data => {
                sum += data;
            });
            let percentage = (value*100 / sum).toFixed(1)+"%";
            return (value*100 / sum) >= 5 ? percentage : '';
        },
        color: '#fff',
        font: {
          weight: 'bold'
        },
         anchor: 'end',
         align: 'start',
         offset: -10
      }
    },
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[400px] flex flex-col justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

CategoryDistributionChart.propTypes = {
  salesByCategoryData: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      totalRevenue: PropTypes.number.isRequired,
      totalQuantity: PropTypes.number.isRequired,
    })
  ),
};

export default CategoryDistributionChart;