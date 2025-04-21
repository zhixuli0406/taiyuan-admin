import PropTypes from "prop-types";
import { ShoppingBag } from "lucide-react";

const TopProductsList = ({ topProducts }) => {
  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5 text-pink-400" />
          熱銷產品
        </h3>
        <p>暫無熱銷產品數據。</p>
      </div>
    );
  }

  // Helper function to generate distinct colors
  const generateColor = (index) => {
    const colors = [
      "#6366f1", // Indigo
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#10b981", // Emerald
      "#f59e0b", // Amber
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ShoppingBag className="mr-2 h-5 w-5 text-pink-400" />
        熱銷產品 (依銷售量)
      </h3>
      <ul className="space-y-3">
        {topProducts.map((product, index) => (
          <li key={product._id} className="flex items-center justify-between">
            <div className="flex items-center">
              <span
                className="inline-block h-3 w-3 rounded-full mr-3"
                style={{ backgroundColor: generateColor(index) }}
              ></span>
              {/* Assuming productDetails contains name, otherwise fallback to _id */}
              {/* API spec for productDetails is vague, adjust if needed */}
              <span className="truncate w-40" title={product.productDetails?.[0]?.name || product._id}>
                 {product.productDetails?.[0]?.name || `產品 ID: ${product._id}`}
              </span>
            </div>
            <span className="font-medium">{product.totalQuantity.toLocaleString()} 件</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

TopProductsList.propTypes = {
  topProducts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      totalQuantity: PropTypes.number.isRequired,
      totalRevenue: PropTypes.number.isRequired,
      productDetails: PropTypes.arrayOf(PropTypes.object), // Keeping it flexible based on API docs
    })
  ),
};

export default TopProductsList; 