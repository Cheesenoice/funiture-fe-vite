import React, { useEffect, useState } from "react";
import axios from "../../api/config/axiosConfig";
import Cookies from "js-cookie";
import Header from "../../components/Layout/Header/Header";
import MyOrder from "./MyOrder";
import { User, Lock, ShoppingBag } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
    position: "",
    status: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on URL
  const getActiveTab = () => {
    if (location.pathname.includes("/account/order")) return "orders";
    if (location.pathname.includes("/account/password")) return "password";
    return "info";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

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
    const token = getAuthToken();
    axios
      .get("/my-accountClient", {
        headers: { Authorization: token },
      })
      .then((res) => {
        if (res.data?.data) {
          const data = res.data.data;
          setUser(data);
          setFormData({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            avatar: data.avatar,
            position: data.position,
            status: data.status,
          });
        }
      })
      .catch((err) => {
        showToast("Không thể tải thông tin người dùng.", "error");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    // Update activeTab when URL changes
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveInfo = () => {
    const token = getAuthToken();
    const payload = {
      ...formData,
      passWord: "",
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then((res) => {
        showToast("Cập nhật thành công!", "success");
        setUser(res.data.data);
        setEditing(false);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleChangePassword = () => {
    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      return showToast("Vui lòng điền đầy đủ mật khẩu.", "error");
    }

    if (newPassword !== confirmPassword) {
      return showToast("Mật khẩu không khớp.", "error");
    }

    const token = getAuthToken();
    const payload = {
      ...formData,
      passWord: newPassword,
      position: String(formData.position || "1"),
      status: formData.status || "active",
    };

    axios
      .patch("/my-accountClient/edit", payload, {
        headers: { Authorization: token },
      })
      .then(() => {
        showToast("Đổi mật khẩu thành công!", "success");
        setPasswordData({ newPassword: "", confirmPassword: "" });
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Đổi mật khẩu thất bại.";
        showToast(msg, "error");
        console.error(err);
      });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "info") navigate("/account");
    else if (tab === "password") navigate("/account/password");
    else if (tab === "orders") navigate("/account/order");
  };

  if (!user)
    return <div className="flex justify-center mt-10">Đang tải...</div>;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-start justify-center p-4 h-8/10">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {/* Left Sidebar Card */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col items-center space-y-4">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={user?.avatar || "https://i.pravatar.cc/150"}
                      onError={(e) => {
                        e.target.src = "https://i.pravatar.cc/150";
                      }}
                      alt="avatar"
                    />
                  </div>
                </div>
                <h2 className="card-title">{user.fullName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="divider"></div>
              <ul className="menu menu-vertical space-y-2">
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "info" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("info")}
                  >
                    <User size={20} />
                    Tùy chỉnh thông tin
                  </a>
                </li>
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "password" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("password")}
                  >
                    <Lock size={20} />
                    Đổi mật khẩu
                  </a>
                </li>
                <li>
                  <a
                    className={`flex items-center gap-2 ${
                      activeTab === "orders" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("orders")}
                  >
                    <ShoppingBag size={20} />
                    Đơn hàng của tôi
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Content Area (spanning 2 columns) */}
          <div className="card bg-base-100 h-fit shadow-xl md:col-span-2">
            <div className="card-body">
              {activeTab === "info" ? (
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Họ tên", name: "fullName" },
                    { label: "Email", name: "email" },
                    { label: "Số điện thoại", name: "phoneNumber" },
                    { label: "Ảnh đại diện (URL)", name: "avatar" },
                  ].map(({ label, name, type = "text" }) => (
                    <div className="form-control" key={name}>
                      <label className="label">{label}</label>
                      <input
                        name={name}
                        type={type}
                        className="input input-bordered"
                        value={formData[name]}
                        onChange={handleFormChange}
                        disabled={!editing}
                      />
                    </div>
                  ))}

                  <div className="col-span-2 flex justify-end space-x-4 mt-4">
                    {editing ? (
                      <>
                        <button
                          onClick={handleSaveInfo}
                          className="btn btn-success"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="btn btn-outline"
                        >
                          Huỷ
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="btn btn-primary"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
              ) : activeTab === "password" ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-control">
                    <label className="label block">Mật khẩu mới</label>
                    <input
                      name="newPassword"
                      type="password"
                      className="input input-bordered"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label block">Xác nhận mật khẩu</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="input input-bordered"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      className="btn btn-warning"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              ) : (
                <MyOrder />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
