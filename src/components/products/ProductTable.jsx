import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import parse from 'html-react-parser';
import axios from "axios";

const ProductTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const SearchHandler = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getCurrentPageProducts = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  };

  const getProduct = async () => {
    const url = window.api + "/products";
    try {
      const response = await axios({
        url: url,
        method: "get",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.status === 200) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      }
    } catch (error) {
      console.log(error);
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const deleteProduct = async (id) => {
    try {
      const url = window.api + "/products/" + id;
      const response = await axios({
        url: url,
        method: "delete",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.status === 200) {
        window.location.href = "/products";
      }
    } catch (error) {
      console.log(error);
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const handleHtmlParse = (html) => {
    const reactElement = parse(html);
    return reactElement;
  }

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.2 }}
    >
      {/* Header and Search */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">產品列表</h2>
        <div className="flex gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md flex"
            onClick={() => { window.location.href = "/createproduct" }}
          >
            <Plus size={20} />
            新增產品
          </button>
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 text-gray-400 sm:left-2.5 top-2.5"
              size={20}
            />
            <input
              type="text"
              placeholder="搜尋產品..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={SearchHandler}
              value={searchTerm}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-400">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                產品名稱
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                產品描述
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                分類
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                價格
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                庫存
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                運送方式
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500">
            {getCurrentPageProducts().map((product) => (
              <motion.tr
                key={product._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.2 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-4 items-center">
                  <img
                    src={product.images[0]}
                    alt="Product_Image"
                    className="size-10"
                  />
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  {handleHtmlParse(product.description)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  {product.categoryName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  $ {product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  {product.transport.toString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium h-full">
                  <div className="flex items-center gap-4 h-full">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        window.location.href = "/editproduct/" + product._id;
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between mt-4 space-x-2 items-center">
        <div className="flex items-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`text-sm px-3 py-1 border rounded-md ${currentPage === 1
              ? "text-gray-400 border-gray-600"
              : "text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800"
              }`}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="mx-2 text-sm font-medium text-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`text-sm px-3 py-1 border rounded-md ${currentPage === totalPages
              ? "text-gray-400 border-gray-600"
              : "text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800"
              }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0">
          Total Products: {filteredProducts.length}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductTable;
