// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Layout/Header/Header";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/v1/cart/", {
          withCredentials: true,
        });

        if (response.data.status === "success") {
          setCart(response.data.data);
        } else {
          setError("Không thể lấy giỏ hàng");
        }
      } catch (err) {
        setError("Lỗi khi lấy giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleDeleteItem = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/cart/delete/${productId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        setCart((prevCart) => ({
          ...prevCart,
          items: prevCart.items.filter((item) => item.product_id !== productId),
        }));
        alert("Sản phẩm đã được xóa khỏi giỏ hàng!");
      } else {
        alert("Không thể xóa sản phẩm");
      }
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/cart/update/${productId}/${quantity}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Cập nhật item cụ thể
        const updatedItems = cart.items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity, totalPrice: item.priceNew * quantity }
            : item
        );

        // Tính lại tổng toàn bộ giỏ hàng
        const newTotal = updatedItems.reduce(
          (acc, item) => acc + item.totalPrice,
          0
        );

        setCart({
          ...cart,
          items: updatedItems,
          totalPrice: newTotal,
        });
      } else {
        alert("Không thể cập nhật số lượng");
      }
    } catch (err) {
      alert("Lỗi khi cập nhật số lượng");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 loading loading-spinner text-primary"></div>
    );
  }

  if (error) {
    return <div className="alert alert-error mt-4 justify-center">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Giỏ hàng của bạn đang trống.
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h1>
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.product_id}
              className="card card-side bg-base-100 shadow-md"
            >
              <figure className="w-32">
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover h-full w-full"
                />
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-lg">{item.name}</h2>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-sm">
                  Giá:{" "}
                  <span className="font-semibold text-primary">
                    {Number(item.priceNew).toLocaleString("vi-VN")}đ
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  {/* Dấu "-" để giảm số lượng */}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.product_id,
                        Math.max(item.quantity - 1, 1)
                      )
                    }
                  >
                    -
                  </button>

                  {/* Hiển thị số lượng */}
                  <span className="text-lg">{item.quantity}</span>

                  {/* Dấu "+" để tăng số lượng */}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() =>
                      handleUpdateQuantity(item.product_id, item.quantity + 1)
                    }
                  >
                    +
                  </button>

                  {/* Nút xóa sản phẩm */}
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => handleDeleteItem(item.product_id)}
                  >
                    Xóa
                  </button>
                </div>

                <p className="text-sm">
                  Tổng:{" "}
                  <span className="font-semibold">
                    {item.totalPrice.toLocaleString()}đ
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-base-200 rounded-lg shadow">
          <h2 className="text-xl font-bold">
            Tổng thanh toán:{" "}
            <span className="text-primary">
              {cart.totalPrice.toLocaleString()}đ
            </span>
          </h2>
          <button className="btn btn-primary btn-wide mt-4">Thanh toán</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
