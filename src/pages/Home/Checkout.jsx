import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag } from "lucide-react";
import Header from "../../components/Layout/Header/Header";

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    const fetchCheckout = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.accessToken;

        if (!token) {
          throw new Error("Không tìm thấy token");
        }

        const response = await axios.get(
          "http://localhost:3000/api/v1/checkout",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.status === "success") {
          setCart(response.data.data);
        } else if (
          response.data.status === "error" &&
          response.data.message === "Cart is empty or not found"
        ) {
          setCart({ items: [] }); // Set empty cart to trigger empty cart UI
        } else {
          setError("Không thể lấy thông tin đơn hàng");
        }
      } catch (err) {
        setError(err.message || "Lỗi khi lấy thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.accessToken;

      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      const response = await axios.post(
        "http://localhost:3000/api/v1/checkout/order",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        if (formData.paymentMethod === "momo") {
          window.location.href = response.data.payUrl;
        } else {
          alert("Đặt hàng COD thành công!");
          window.location.href = "/order-confirmation";
        }
      } else {
        alert("Không thể xử lý đơn hàng");
      }
    } catch (err) {
      alert(err.message || "Lỗi khi xử lý đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const getValidImage = (image) => {
    return image && image !== "null" && image !== "undefined"
      ? image
      : "/collection/collection-chair.jpg";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center text-gray-500 p-4">
          <ShoppingBag className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-xl font-semibold">Giỏ hàng của bạn đang trống</p>
          <a href="/" className="btn btn-primary mt-4">
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-6">Thanh toán</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form thông tin thanh toán */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">
                Thông tin giao hàng
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Họ và tên</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Số điện thoại</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Địa chỉ giao hàng</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full"
                    required
                  ></textarea>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phương thức thanh toán</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="label cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                    </label>
                    <label className="label cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={formData.paymentMethod === "momo"}
                        onChange={handleInputChange}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2">MoMo</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full mt-4"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner"></span>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Xác nhận đơn hàng"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div>
            <div className="card bg-base-100 shadow-md p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3 text-sm">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={getValidImage(item.image)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/collection/collection-chair.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p>
                        {parseFloat(item.priceNew).toLocaleString("vi-VN")}₫ x
                        {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {item.totalPrice.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-success">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span>{cart.totalPrice.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
