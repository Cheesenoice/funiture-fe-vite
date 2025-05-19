import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const formatCurrency = (amount) => {
  if (typeof amount !== "number" && typeof amount !== "string") return "N/A";
  const numberAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numberAmount)) return "N/A";
  return numberAmount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const flattenCategories = (categories) => {
  if (!Array.isArray(categories)) return [];
  const flatList = [];
  const processCategory = (category, parentName = null) => {
    const displayName = parentName
      ? `${parentName} > ${category.name}`
      : category.name;
    flatList.push({ id: category.category_id, name: displayName });
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach((sub) =>
        processCategory(sub, category.name)
      );
    }
  };
  categories.forEach((cat) => processCategory(cat));
  return flatList;
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryError, setCategoryError] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);
  const [confirmBulkStatus, setConfirmBulkStatus] = useState(null);
  // New state for delete confirmation modal
  const [productToDeleteId, setProductToDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  const fetchCategories = useCallback(() => {
    setCategoryError(null);
    try {
      const cachedCategoriesString = sessionStorage.getItem("categories_cache");
      if (cachedCategoriesString) {
        const parsedData = JSON.parse(cachedCategoriesString);
        let categoriesArray = null;
        if (Array.isArray(parsedData)) {
          categoriesArray = parsedData;
        } else if (
          parsedData &&
          typeof parsedData === "object" &&
          Array.isArray(parsedData.data)
        ) {
          categoriesArray = parsedData.data;
        }
        if (categoriesArray) {
          const flattened = flattenCategories(categoriesArray);
          setAllCategories(flattened);
        } else {
          setCategoryError("Định dạng dữ liệu danh mục không hợp lệ.");
          setAllCategories([]);
        }
      } else {
        setCategoryError("Không tìm thấy dữ liệu danh mục trong cache.");
        setAllCategories([]);
      }
    } catch (e) {
      setCategoryError("Lỗi khi tải danh mục từ cache.");
      setAllCategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/v1/product", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
      const result = await response.json();
      if (
        Array.isArray(result) &&
        result.length > 0 &&
        result[0]?.code === 200 &&
        Array.isArray(result[0]?.data)
      ) {
        setProducts(result[0].data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message || "Lỗi tải sản phẩm.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategoryId) {
      filtered = filtered.filter(
        (p) => p.product_category_id === selectedCategoryId
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.status === "active");
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => p.status === "inactive");
    }

    return filtered;
  }, [products, selectedCategoryId, statusFilter]);

  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleEdit = (productId) => {
    console.log("Navigating to edit product:", productId);
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleAdd = () => {
    console.log("Navigating to add product");
    navigate("/admin/products/add");
  };

  // Function to open delete confirmation modal
  const openConfirmDeleteModal = (productId) => {
    setProductToDeleteId(productId);
  };

  // Function to perform delete after modal confirmation
  const confirmDeleteProduct = useCallback(async () => {
    if (!productToDeleteId) return; // Should not happen if modal is open

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/product/delete/${productToDeleteId}`,
        {
          method: "PATCH", // Assuming soft delete via PATCH
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi xóa sản phẩm: ${response.status} - ${
            errorData?.message || response.statusText
          }`
        );
      }
      console.log(
        `Sản phẩm ID ${productToDeleteId} đã được xóa (soft delete).`
      );
      // Re-fetch products to update the list
      fetchProducts();
      // Close the modal
      setProductToDeleteId(null);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      setError(err.message || "Đã xảy ra lỗi khi xóa sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [
    productToDeleteId,
    fetchProducts,
    setLoading,
    setError,
    setProductToDeleteId,
  ]);

  const handleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const openConfirmStatusModal = (id, currentStatus) => {
    setConfirmStatusChange({
      id,
      newStatus: currentStatus === "active" ? "inactive" : "active",
    });
  };

  const toggleProductStatus = useCallback(async () => {
    if (!confirmStatusChange) return;
    setLoading(true);
    setError(null);
    try {
      const { id, newStatus } = confirmStatusChange;
      const response = await fetch(
        `http://localhost:3000/api/v1/product/change-status/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi thay đổi trạng thái: ${response.status} - ${
            errorData?.message || response.statusText
          }`
        );
      }
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, status: newStatus } : product
        )
      );
      setConfirmStatusChange(null);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái sản phẩm:", err);
      setError(err.message || "Đã xảy ra lỗi khi thay đổi trạng thái.");
    } finally {
      setLoading(false);
    }
  }, [confirmStatusChange, setLoading, setError, setProducts]);

  const openConfirmBulkModal = (status) => {
    if (selectedProductIds.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }
    setConfirmBulkStatus(status);
  };

  const bulkChangeStatus = useCallback(async () => {
    if (!confirmBulkStatus || selectedProductIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/product/change-multi",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: selectedProductIds,
            key: "status",
            value: confirmBulkStatus,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Lỗi thay đổi trạng thái hàng loạt: ${response.status} - ${
            errorData?.message || response.statusText
          }`
        );
      }
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          selectedProductIds.includes(product._id)
            ? { ...product, status: confirmBulkStatus }
            : product
        )
      );
      setSelectedProductIds([]);
      setConfirmBulkStatus(null);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái hàng loạt:", err);
      setError(
        err.message || "Đã xảy ra lỗi khi thay đổi trạng thái hàng loạt."
      );
    } finally {
      setLoading(false);
    }
  }, [
    confirmBulkStatus,
    selectedProductIds,
    setLoading,
    setError,
    setProducts,
    setSelectedProductIds,
  ]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold text-primary">📦 Quản lý sản phẩm</h1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-6 gap-4">
        <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full md:w-auto">
          <div className="form-control w-full md:w-auto md:min-w-[250px]">
            <label className="label pt-0">
              <span className="label-text">Lọc theo danh mục</span>
            </label>
            <select
              className={`select select-bordered w-full ${
                categoryError || loading || allCategories.length === 0
                  ? "select-disabled opacity-70"
                  : ""
              }`}
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              disabled={
                loading || !!categoryError || allCategories.length === 0
              }
            >
              <option value="">-- Tất cả danh mục --</option>
              {allCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoryError && (
              <span className="text-error text-xs mt-1">{categoryError}</span>
            )}
            {!categoryError && allCategories.length === 0 && !loading && (
              <span className="text-warning text-xs mt-1">
                Không có danh mục để lọc.
              </span>
            )}
          </div>

          <div className="form-control w-full md:w-auto md:min-w-[180px]">
            <label className="label pt-0">
              <span className="label-text">Lọc theo trạng thái</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              disabled={loading}
            >
              <option value="all">-- Tất cả trạng thái --</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>

          <div className="form-control w-full md:w-auto self-end">
            <label className="label pt-0 hidden md:block">
              <span className="label-text"> </span>
            </label>
            <button
              className="btn btn-primary w-full md:w-auto"
              onClick={handleAdd}
              disabled={loading}
            >
              <FaPlus className="mr-2" /> Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      {selectedProductIds.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm opacity-70">
            {selectedProductIds.length} sản phẩm đã chọn
          </span>
          <button
            className="btn btn-sm btn-outline btn-warning"
            onClick={() => openConfirmBulkModal("inactive")}
            disabled={loading}
          >
            Ngừng hoạt động
          </button>
          <button
            className="btn btn-sm btn-outline btn-success"
            onClick={() => openConfirmBulkModal("active")}
            disabled={loading}
          >
            Hoạt động
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="ml-3">Đang tải dữ liệu...</p>
        </div>
      )}
      {!loading && error && (
        <div role="alert" className="alert alert-error shadow-lg mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Lỗi tải sản phẩm!</strong> {error}
          </span>
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto ">
          <table className="table w-full">
            <thead className="bg-base-200 text-base-content">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={(e) =>
                      setSelectedProductIds(
                        e.target.checked
                          ? filteredProducts.map((p) => p._id)
                          : []
                      )
                    }
                    checked={
                      selectedProductIds.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    disabled={filteredProducts.length === 0}
                  />
                </th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá gốc</th>
                <th>Giá mới</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    {products.length === 0
                      ? "Không có sản phẩm nào."
                      : "Không tìm thấy sản phẩm phù hợp."}
                  </td>
                </tr>
              )}
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover">
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedProductIds.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                    />
                  </th>
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img
                          src={product.thumbnail || "/placeholder.png"}
                          alt={product.title}
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold">{product.title}</div>
                    <div className="text-sm opacity-70">ID: {product._id}</div>
                  </td>
                  <td>{formatCurrency(product.price)}</td>
                  <td className="font-semibold text-accent">
                    {formatCurrency(product.priceNew)}
                    {product.discountPercentage > 0 && (
                      <span className="badge badge-ghost badge-sm ml-2">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </td>
                  <td>{product.stock ?? "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        product.status === "active"
                          ? "badge-success"
                          : "badge-ghost"
                      } badge-md`}
                    >
                      {product.status === "active"
                        ? "Hoạt động"
                        : product.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2 items-center">
                      <button
                        className="btn btn-sm btn-info btn-outline"
                        onClick={() => handleEdit(product._id)}
                        aria-label={`Chỉnh sửa ${product.title}`}
                      >
                        <FaEdit />
                      </button>
                      {/* --- MODIFIED DELETE BUTTON --- */}
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        // Call openConfirmDeleteModal instead of handleDelete
                        onClick={() => openConfirmDeleteModal(product._id)}
                        aria-label={`Xóa ${product.title}`}
                        disabled={loading}
                      >
                        <FaTrashAlt />
                      </button>
                      {/* --- END MODIFIED DELETE BUTTON --- */}
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          openConfirmStatusModal(product._id, product.status)
                        }
                        disabled={loading}
                      >
                        {product.status === "active" ? "Ngừng" : "Kích"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      <input
        type="checkbox"
        id="confirm-status-modal"
        className="modal-toggle"
        checked={!!confirmStatusChange}
        onChange={() => setConfirmStatusChange(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xác nhận thay đổi trạng thái</h3>
          <p className="py-4">
            Bạn có chắc chắn muốn{" "}
            {confirmStatusChange?.newStatus === "active"
              ? "kích hoạt"
              : "ngừng hoạt động"}{" "}
            sản phẩm này?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={toggleProductStatus}
              disabled={loading}
            >
              Xác nhận
            </button>
            <button
              className="btn"
              onClick={() => setConfirmStatusChange(null)}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Status Change Confirmation Modal */}
      <input
        type="checkbox"
        id="confirm-bulk-modal"
        className="modal-toggle"
        checked={!!confirmBulkStatus}
        onChange={() => setConfirmBulkStatus(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Xác nhận thay đổi trạng thái hàng loạt
          </h3>
          <p className="py-4">
            Bạn có chắc chắn muốn đặt trạng thái của {selectedProductIds.length}{" "}
            sản phẩm thành "
            {confirmBulkStatus === "active" ? "Hoạt động" : "Ngừng hoạt động"}"?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={bulkChangeStatus}
              disabled={loading}
            >
              Xác nhận
            </button>
            <button
              className="btn"
              onClick={() => setConfirmBulkStatus(null)}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* --- NEW DELETE CONFIRMATION MODAL --- */}
      <input
        type="checkbox"
        id="confirm-delete-modal"
        className="modal-toggle"
        checked={!!productToDeleteId} // Modal is open if productToDeleteId is set
        onChange={() => setProductToDeleteId(null)} // Allow closing by clicking outside
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">
            Xác nhận xóa sản phẩm
          </h3>
          <p className="py-4">
            Bạn có chắc chắn muốn xóa sản phẩm có ID:{" "}
            <span className="font-semibold">{productToDeleteId}</span> không?
            <br />
            Lưu ý: Hành động này thường là "soft delete" (chỉ ẩn sản phẩm khỏi
            trang hiển thị) thay vì xóa vĩnh viễn khỏi cơ sở dữ liệu.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={confirmDeleteProduct} // Call the confirmation function
              disabled={loading}
              aria-label="Xác nhận xóa sản phẩm đã chọn"
            >
              Xóa
            </button>
            <button
              className="btn"
              onClick={() => setProductToDeleteId(null)} // Cancel closes the modal
              disabled={loading}
              aria-label="Hủy xóa sản phẩm"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
      {/* --- END NEW DELETE CONFIRMATION MODAL --- */}
    </div>
  );
};

export default ProductManagement;
