// src/components/Home.jsx
import React from "react";
import Header from "../../components/Layout/Header/Header";
import ProductCarousel from "../../components/Sections/ProductCarousel";
import ProductList from "../../components/Sections/ProductList";
import Collection from "../../components/Sections/Collection";

function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Collection />
      <ProductCarousel />
      <ProductList />
    </div>
  );
}

export default Home;
