import React, { useEffect, useState } from "react";
import axios from "../../api/config/axiosConfig"; // Đảm bảo đường dẫn này đúng
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

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") {
      return "N/A"; // Hoặc giá trị mặc định khác
    }
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Hàm định dạng ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Bắt đầu loading
      try {
        const token = getAuthToken();
        if (!token) {
          showToast("Vui lòng đăng nhập để xem đơn hàng.", "error");
          setLoading(false);
          return; // Dừng nếu không có token
        }
        const response = await axios.get(
          "http://localhost:3000/api/v1/order/my-order",
          {
            headers: { Authorization: token },
          }
        );

        if (response.data?.success) {
          // Sắp xếp đơn hàng mới nhất lên đầu (tùy chọn)
          const sortedOrders = response.data.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);
        } else {
          showToast(
            response.data?.message || "Không thể tải danh sách đơn hàng.",
            "error"
          );
        }
      } catch (err) {
        // Xử lý lỗi cụ thể hơn nếu có thể (ví dụ: lỗi 401 Unauthorized)
        if (err.response?.status === 401) {
          showToast(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
            "error"
          );
          // Optional: redirect to login page
          // Cookies.remove("token");
          // window.location.href = '/login';
        } else {
          showToast("Lỗi kết nối hoặc lỗi máy chủ khi tải đơn hàng.", "error");
        }
        console.error("Fetch Orders Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // Chỉ chạy một lần khi component mount

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10 h-40">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-3">Đang tải lịch sử đơn hàng...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {" "}
      {/* Giới hạn chiều rộng và căn giữa */}
      {toast.visible && (
        <div className="toast toast-top toast-end z-50">
          {" "}
          {/* Đảm bảo toast hiển thị trên cùng */}
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            } shadow-lg`} // Thêm đổ bóng cho toast
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-6">
          {" "}
          {/* Tăng khoảng cách giữa các đơn hàng */}
          {orders.map((order) => {
            // Tính toán tổng tiền sản phẩm (sau chiết khấu)
            const totalProductCost = order.product.reduce((sum, item) => {
              const itemPrice =
                item.price * (1 - (item.discountPercentage || 0) / 100);
              return sum + item.quantity * itemPrice;
            }, 0);

            // Tính tổng tiền cuối cùng (sản phẩm + phí ship)
            const finalTotal = totalProductCost + (order.shippingFee || 0);

            // Lấy trạng thái đơn hàng mới nhất
            const currentOrderStatus =
              order.orderStatus && order.orderStatus.length > 0
                ? order.orderStatus[order.orderStatus.length - 1]
                : { status: "Không xác định", updatedAt: null }; // Mặc định nếu không có status

            return (
              <div
                key={order._id}
                className="card bg-base-100 shadow-lg border border-gray-200"
              >
                {" "}
                {/* Thêm border và shadow rõ hơn */}
                <div className="card-body p-5">
                  {" "}
                  {/* Thêm padding cho card */}
                  {/* Header của đơn hàng */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-gray-200">
                    <div>
                      <h3 className="card-title text-lg">
                        Đơn hàng #{order._id.slice(-8)}{" "}
                        {/* Hiển thị nhiều hơn ID */}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ngày đặt: {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-col sm:items-end space-y-1">
                      {/* Trạng thái đơn hàng */}
                      <span className="badge badge-lg badge-info">
                        {" "}
                        {/* Badge rõ hơn */}
                        {currentOrderStatus.status}
                      </span>
                      {/* Trạng thái thanh toán */}
                      <span
                        className={`badge badge-md ${
                          /* Kích thước phù hợp */
                          order.paymentStatus === "pending"
                            ? "badge-warning"
                            : order.paymentStatus === "completed" // Giả sử có trạng thái 'completed'
                            ? "badge-success"
                            : "badge-ghost" // Trạng thái khác nếu có
                        }`}
                      >
                        Thanh toán:{" "}
                        {
                          order.paymentStatus === "pending"
                            ? "Đang chờ"
                            : order.paymentStatus === "completed"
                            ? "Hoàn thành"
                            : order.paymentStatus /* Hiển thị trạng thái gốc nếu không khớp */
                        }
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Cập nhật trạng thái:{" "}
                        {formatDateTime(currentOrderStatus.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {/* Thông tin người nhận */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Thông tin người nhận</h4>
                    <p>
                      <span className="font-medium">Tên:</span>{" "}
                      {order.user_infor.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.user_infor.email}
                    </p>
                    <p>
                      <span className="font-medium">Địa chỉ:</span>{" "}
                      {order.user_infor.address}
                    </p>
                    <p>
                      <span className="font-medium">Số điện thoại:</span>{" "}
                      {order.user_infor.phone}
                    </p>
                  </div>
                  {/* Danh sách sản phẩm */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Chi tiết sản phẩm</h4>
                    <div className="space-y-2">
                      {order.product.map((item) => (
                        <div
                          key={item._id} // Sử dụng _id duy nhất của sản phẩm trong đơn hàng
                          className="flex justify-between items-center text-sm border-b border-gray-100 pb-1"
                        >
                          <div>
                            <p className="font-medium">
                              SP #{item.product_id.slice(-6)}
                            </p>
                            {/* Có thể thêm tên sản phẩm ở đây nếu API trả về */}
                            {/* <p className="text-xs text-gray-500">Tên sản phẩm...</p> */}
                          </div>

                          <div className="text-right">
                            <p>SL: {item.quantity}</p>
                            <p>
                              Đơn giá:{" "}
                              {formatCurrency(
                                item.price *
                                  (1 - (item.discountPercentage || 0) / 100)
                              )}
                            </p>
                            {item.discountPercentage > 0 && (
                              <p className="text-xs text-red-500">
                                (-{item.discountPercentage}%)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Tổng kết đơn hàng */}
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền sản phẩm:</span>
                      <span className="font-medium">
                        {formatCurrency(totalProductCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="font-medium">
                        {formatCurrency(order.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Phương thức TT:</span>
                      <span className="font-medium">
                        {order.paymentMethod === "cod"
                          ? "Thanh toán khi nhận hàng (COD)"
                          : order.paymentMethod === "momo"
                          ? "Ví Momo"
                          : order.paymentMethod}{" "}
                        {/* Hiển thị tên gốc nếu không khớp */}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrder;
