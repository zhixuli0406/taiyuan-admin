import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/common_components/Sidebar";

import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import SigninPage from "./pages/SigninPage";
import CreateProduct from "./pages/CreateProductPage";
import EditProduct from "./pages/EditProductPage";
import CategoriesPage from "./pages/CategoriesPage";

const App = () => {
  return localStorage.getItem("token") ? (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* BACKGROUND SETTINGS */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      <Sidebar />

      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/createproduct" element={<CreateProduct />} />
        <Route path='/editproduct/:id'element={<EditProduct />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  ) : (
    <Routes>
      <Route path="/" element={<SigninPage />} />
    </Routes>
  );
};

export default App;
