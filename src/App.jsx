// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Layout/Footer/Footer";
import Home from "./pages/Home/Home";
import Login from "./pages/Home/Login/Login";
import ProductCollection from "./pages/Home/ProductCollection";
import ProductDetail from "./pages/Home/ProductDetail";
import Cart from "./pages/Home/Cart";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
