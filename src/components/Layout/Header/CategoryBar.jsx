// src/components/CategoryBar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { categoryService } from "../../../api";

const CategoryBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        if (data.success) {
          setCategories(data.data);
        } else {
          console.error("Failed to fetch categories:", data.error);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setOpenDropdown(null);
  };

  const toggleDropdown = (categoryId) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  return (
    <div className="bg-gray-100 py-2 px-6">
      {/* Drawer (Mobile) */}
      <div className="drawer md:hidden">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label
            htmlFor="my-drawer"
            className="flex items-center space-x-2 cursor-pointer text-black"
          >
            <Menu className="w-6 h-6" />
            <p className="text-base font-medium">Danh mục</p>
          </label>
        </div>
        <div className="drawer-side z-50">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-64 p-4 space-y-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <li key={category.category_id}>
                  <details>
                    <summary className="hover:text-primary font-medium">
                      <Link
                        to={`/productscollection/category/${category.description}`}
                        state={{ categoryName: category.name }}
                      >
                        {category.name}
                      </Link>
                    </summary>
                    {category.subcategories.length > 0 && (
                      <ul className="ml-4 space-y-2 pt-3">
                        {category.subcategories.map((subcategory) => (
                          <li key={subcategory.category_id}>
                            <Link
                              to={`/productscollection/category/${subcategory.description}`}
                              state={{ categoryName: subcategory.name }}
                              className="block hover:text-primary font-medium"
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </li>
              ))
            ) : (
              <li>No categories available</li>
            )}
          </ul>
        </div>
      </div>

      {/* Category List (Desktop) */}
      <ul className="hidden flex-wrap md:flex space-x-6 justify-center">
        {categories.length > 0 ? (
          categories.map((category) => (
            <li key={category.category_id} className="dropdown dropdown-hover">
              <Link
                to={`/productscollection/category/${category.description}`}
                state={{ categoryName: category.name }}
                className="hover:text-primary font-medium py-2 flex items-center cursor-pointer"
              >
                {category.name}
                {category.subcategories.length > 0 && (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Link>
              {category.subcategories.length > 0 && (
                <ul className="dropdown-content menu bg-white shadow-lg rounded-md w-48 p-2">
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.category_id}>
                      <Link
                        to={`/productscollection/category/${subcategory.description}`}
                        state={{ categoryName: subcategory.name }}
                        className="block px-4 py-2 hover:bg-gray-200"
                      >
                        {subcategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        ) : (
          <li>No categories available</li>
        )}
      </ul>
    </div>
  );
};

export default CategoryBar;
