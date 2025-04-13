import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css"; // CSS cơ bản của Swiper
import "swiper/css/navigation"; // CSS cho nút điều hướng
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../Common/ProductCard";

const products = [
  {
    id: 1,
    name: "Basic Tee",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg",
    imageAlt: "Front of men's Basic Tee in black.",
    price: "$35",
    color: "Black",
  },
  {
    id: 2,
    name: "Premium Hoodie",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg",
    imageAlt: "Front of men's Premium Hoodie in gray.",
    price: "$50",
    color: "Gray",
  },
  {
    id: 3,
    name: "Casual Sneakers",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg",
    imageAlt: "Men's casual sneakers in white.",
    price: "$60",
    color: "White",
  },
  {
    id: 4,
    name: "Denim Jacket",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg",
    imageAlt: "Men's denim jacket in blue.",
    price: "$80",
    color: "Blue",
  },
  {
    id: 5, // Sửa id trùng lặp
    name: "Denim Jacket",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg",
    imageAlt: "Men's denim jacket in blue.",
    price: "$80",
    color: "Blue",
  },
  {
    id: 6, // Sửa id trùng lặp
    name: "Denim Jacket",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg",
    imageAlt: "Men's denim jacket in blue.",
    price: "$80",
    color: "Blue",
  },
];

export default function ProductCarousel() {
  return (
    <div className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-15 lg:px-20">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          Customers also purchased
        </h2>

        <div className="relative">
          <Swiper
            modules={[Navigation]} // Sử dụng module Navigation
            spaceBetween={8} // Khoảng cách giữa các slide (tương đương -mx-2)
            slidesPerView={3} // Mặc định 3 sản phẩm
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }} // Custom nút điều hướng
            breakpoints={{
              0: { slidesPerView: 2 }, // Mobile: 1 sản phẩm
              768: { slidesPerView: 3 }, // Tablet: 3 sản phẩm
              1024: { slidesPerView: 4 }, // Desktop: 4 sản phẩm
            }}
            className="mySwiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <div className="px-2">
                  <ProductCard product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nút điều hướng custom */}
          <button className="swiper-button-prev-custom absolute cursor-pointer -left-2 lg:-left-10 top-1/2 -translate-y-1/2 z-10">
            <ChevronLeft className="w-10 h-10 text-gray-900" />
          </button>
          <button className="swiper-button-next-custom absolute cursor-pointer -right-2 lg:-right-10 top-1/2 -translate-y-1/2 z-10">
            <ChevronRight className="w-10 h-10 text-gray-900" />
          </button>
        </div>
      </div>
    </div>
  );
}
