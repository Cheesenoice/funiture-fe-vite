// src/pages/ProductCollection.jsx
import { useParams, useLocation } from "react-router-dom";
import ProductList from "../../components/Sections/ProductList";
import Header from "../../components/Layout/Header/Header";

export default function ProductCollection({ filter }) {
  const { categoryDescription } = useParams(); // Thay categoryId bằng categoryDescription
  const location = useLocation();
  const categoryName = location.state?.categoryName || "Unknown Category"; // Lấy categoryName từ state

  return (
    <div className="bg-white">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {filter === "new"
            ? "New Products"
            : filter === "featured"
            ? "Featured Products"
            : filter === "category"
            ? categoryName // Hiển thị category.name
            : "All Products"}
        </h2>
        <ProductList
          filter={filter}
          categoryDescription={categoryDescription}
        />
      </div>
    </div>
  );
}
