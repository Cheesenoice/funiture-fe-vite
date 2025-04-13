// src/components/Sections/ProductList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../Common/ProductCard";
import { productService } from "../../api/services/productService";
import { categoryService } from "../../api";

export default function ProductList({ categoryDescription }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = { page, limit: 12 };
        if (categoryDescription) {
          params.slug = categoryDescription;
        }

        const response = await productService.getProducts(params);
        if (response.success) {
          let filteredProducts = response.data.products;

          if (categoryDescription && categories.length > 0) {
            const category = categories.find(
              (cat) => cat.description === categoryDescription
            );
            if (category) {
              const validCategoryIds = [
                category.category_id,
                ...category.subcategories.map((sub) => sub.category_id),
              ];
              filteredProducts = response.data.products.filter((product) =>
                validCategoryIds.includes(product.product_category_id)
              );
            }
          }

          setProducts(filteredProducts); // Pass raw data to ProductCard
        } else {
          throw new Error(response.error || "Failed to fetch products");
        }
        setLoading(false);
      } catch (err) {
        setError("Không thể tải sản phẩm");
        setLoading(false);
      }
    };

    if (categories.length > 0 || !categoryDescription) {
      fetchProducts();
    }
  }, [categoryDescription, page, categories]);

  if (loading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p>Không có sản phẩm nào để hiển thị.</p>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <div className="join">
            <button
              className="join-item btn btn-square"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              «
            </button>
            {[1, 2, 3].map((p) => (
              <input
                key={p}
                className="join-item btn btn-square"
                type="radio"
                name="options"
                aria-label={p.toString()}
                checked={page === p}
                onChange={() => setPage(p)}
              />
            ))}
            <button
              className="join-item btn btn-square"
              onClick={() => setPage((p) => p + 1)}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
