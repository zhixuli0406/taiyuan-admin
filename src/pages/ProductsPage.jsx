import Header from "../components/common_components/Header";
import ProductTable from "../components/products/ProductTable";
const ProductsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="產品" />

      {/* STAT DATA  */}
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* PRODUCT TABLE */}
        <ProductTable />
      </main>
    </div>
  );
};

export default ProductsPage;
