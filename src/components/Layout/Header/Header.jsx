import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import CategoryBar from "./CategoryBar";
import { Search, ShoppingCart, Heart } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!Cookies.get("token"); // Check if token cookie exists

  const [cartCount, setCartCount] = useState(0);

  // Gọi API lấy số lượng sản phẩm trong giỏ
  const fetchCartCount = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/cart/", {
        withCredentials: true,
      });

      const items = res.data?.data?.items || [];
      setCartCount(items.length); // ✅ Đếm số sản phẩm, không tính quantity
    } catch (err) {
      console.error("Lỗi lấy số lượng giỏ hàng:", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const handleLogout = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });
    navigate("/");
  };

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-gray-100 text-black text-sm py-2 px-4 flex sm:flex-row justify-between items-center transition-all duration-300">
        <span className="text-center sm:text-left">
          Miễn phí vận chuyển cho mọi đơn hàng từ 999.000 VNĐ - Hotline
          1900-2555-79
        </span>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          {isLoggedIn && (
            <Link
              to="/account"
              className="hover:text-primary cursor-pointer underline-hover"
            >
              Tài khoản của tôi
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hover:text-primary cursor-pointer underline-hover"
            >
              Đăng xuất
            </button>
          ) : (
            <Link
              to="/login"
              className="hover:text-primary cursor-pointer underline-hover"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="z-50 bg-primary text-gray-100 py-4 px-4 flex flex-row justify-between items-center shadow-md">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="group">
            <h1 className="text-2xl font-bold transition-transform duration-200 group-hover:scale-105 active:scale-95">
              MUJI
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-4 font-semibold">
            <Link to="/productscollection/new" className="underline-hover">
              Hàng Mới
            </Link>
            <Link to="/productscollection/featured" className="underline-hover">
              Nổi Bật
            </Link>
            <Link to="/productscollection/" className="underline-hover">
              Tất cả sản phẩm
            </Link>
          </nav>
        </div>

        {/* Search Bar, Wishlist và Cart */}
        <div className="flex items-center space-x-4 flex-grow justify-end ">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="input input-bordered bg-gray-100 w-full text-black text-sm py-1 h-8"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Wishlist Icon */}
          <div className="relative flex-shrink-0">
            <button className="cursor-pointer">
              <Heart className="text-gray-100 w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full px-1.5">
                0
              </span>
            </button>
          </div>

          {/* Cart Icon */}
          <div className="relative flex-shrink-0">
            <Link to="/cart" className="cursor-pointer relative block">
              <ShoppingCart className="text-gray-100 w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full px-1.5">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Bar */}
      <CategoryBar />
    </div>
  );
};

export default Header;
