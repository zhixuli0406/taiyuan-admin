import { Routes, Route } from "react-router-dom";
import Header from "../components/common_components/Header";
import CouponTable from "../components/coupons/CouponTable";
import CreateCoupon from "../components/coupons/CreateCoupon";

const CouponsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="優惠券" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <Routes>
          <Route path="/" element={<CouponTable />} />
          <Route path="/create" element={<CreateCoupon />} />
        </Routes>
      </main>
    </div>
  );
};

export default CouponsPage; 