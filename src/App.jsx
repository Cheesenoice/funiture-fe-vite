import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Layout/Footer/Footer";
import Home from "./pages/Home/Home";
import Login from "./pages/Home/Login/Login";
import ProductCollection from "./pages/Home/ProductCollection";
import ProductDetail from "./pages/Home/ProductDetail";
import Cart from "./pages/Home/Cart";
import Profile from "./pages/User/Profile";
import Header from "./components/Layout/Header/Header";
import SearchAi from "./components/Common/SearchAi";
import Checkout from "./pages/Home/Checkout";
import ThankYou from "./pages/Home/ThankYou";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/account/password" element={<Profile />} />
          <Route path="/account/order" element={<Profile />} />
          <Route path="/search" element={<SearchAi />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/productscollection" element={<ProductCollection />} />
          <Route
            path="/productscollection/new"
            element={<ProductCollection filter="new" />}
          />
          <Route
            path="/productscollection/featured"
            element={<ProductCollection filter="featured" />}
          />
          <Route path="/ " element={<ProductCollection filter="category" />} />
          <Route path="/productdetail/:slug" element={<ProductDetail />} />
          <Route
            path="/productscollection/category/:categoryDescription"
            element={<ProductCollection filter="category" />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
