// src/api/services/productService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/products/";

export const productService = {
  getProducts: async (params = {}) => {
    try {
      const { slug, page = 1, limit = 12 } = params;
      const url = slug ? `${API_URL}${slug}` : API_URL;
      const response = await axios.get(url, {
        params: { page, limit },
      });

      let products = [];
      if (Array.isArray(response.data) && response.data[0]?.code === 200) {
        products = response.data[0].data;
      } else if (response.data.success && response.data.data?.products) {
        products = response.data.data.products;
      } else {
        throw new Error("Invalid API response format");
      }

      return {
        success: true,
        data: { products },
      };
    } catch (error) {
      console.error(
        "Error fetching products:",
        error.response?.data || error.message
      );
      return { success: false, error: error.message };
    }
  },

  getProductBySlug: async (slug) => {
    try {
      const response = await axios.get(`${API_URL}detail/${slug}`);
      if (response.data.success && response.data.data?.product) {
        return {
          success: true,
          data: {
            product: response.data.data.product,
            relatedProducts: response.data.data.relatedProducts,
          },
        };
      }
      throw new Error("Invalid product detail response");
    } catch (error) {
      console.error(
        "Error fetching product detail:",
        error.response?.data || error.message
      );
      return { success: false, error: error.message };
    }
  },
};
