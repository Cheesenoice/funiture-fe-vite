import React, { useEffect, useState } from "react";
import axios from "../../api/config/axiosConfig";
import Cookies from "js-cookie";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  const getAuthToken = () => {
    const token = Cookies.get("token");
    return token ? `Bearer ${token}` : "";
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(
          "http://localhost:3000/api/v1/my-order",
          {
            headers: { Authorization: token },
          }
        );

        if (response.data?.success) {
          setOrders(response.data.data);
        } else {
          showToast("Không thể tải danh sách đơn hàng.", "error");
        }
      } catch (err) {
        showToast("Lỗi khi tải danh sách đơn hàng.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center mt-10">Đang tải...</div>;
  }

  return (
    <div className="w-full">
      {toast.visible && (
        <div className="toast toast-top toast-end">
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card bg-base-100 shadow-md p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    Đơn hàng #{order._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`badge ${
                      order.paymentStatus === "pending"
                        ? "badge-warning"
                        : "badge-success"
                    }`}
                  >
                    {order.paymentStatus === "pending"
                      ? "Đang chờ"
                      : "Hoàn thành"}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">Thông tin người nhận</h4>
                <p>Tên: {order.user_infor.name}</p>
                <p>Email: {order.user_infor.email}</p>
                <p>Địa chỉ: {order.user_infor.address}</p>
                <p>Số điện thoại: {order.user_infor.phone}</p>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">Sản phẩm</h4>
                {order.product.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-sm mt-2"
                  >
                    <span>Sản phẩm #{item.product_id.slice(-6)}</span>
                    <span>
                      {item.quantity} x{" "}
                      {(
                        item.price *
                        (1 - item.discountPercentage / 100)
                      ).toLocaleString()}{" "}
                      VNĐ
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {order.paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : "Momo"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrder;
