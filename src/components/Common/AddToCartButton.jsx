import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

function AddToCartButton({ productId, disabled }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const cartId = Cookies.get("cartId");

  const handleAddToCart = async () => {
    if (!cartId) {
      setToast({ type: "error", message: "Bạn phải đăng nhập trước" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/cart/add/${productId}`,
        { quantity },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setToast({ type: "success", message: "Thêm vào giỏ hàng thành công!" });
        setShowModal(false);
      } else {
        throw new Error(response.data.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      setToast({
        type: "error",
        message:
          "Lỗi khi thêm vào giỏ hàng: " +
          (error.response?.data?.message || error.message),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ẩn toast sau 3 giây
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`toast toast-top toast-center z-50`}>
          <div
            className={`alert shadow-lg w-80 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "info"
                ? "bg-blue-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Nút mở modal */}
      <button
        className={`btn btn-outline btn-primary btn-sm w-full mt-2 ${
          disabled ? "btn-disabled" : ""
        }`}
        onClick={() => setShowModal(true)}
        disabled={disabled}
      >
        Thêm vào giỏ
      </button>

      {/* Modal chọn số lượng */}
      {showModal && (
        <dialog id="addToCartModal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Chọn số lượng</h3>

            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>

            <div className="modal-action flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowModal(false);
                  setQuantity(1);
                }}
              >
                Hủy
              </button>
              <button
                className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                onClick={handleAddToCart}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

export default AddToCartButton;
