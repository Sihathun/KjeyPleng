import { create } from "zustand";
import axios from "axios";

const API_URL = "/api/products";

axios.defaults.withCredentials = true;

export const useProductStore = create((set, get) => ({
  products: [],
  myListings: [],
  currentProduct: null,
  categories: [],
  dashboardStats: null,
  isLoading: false,
  error: null,

  // Fetch all products (public)
  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.listing_type) params.append("listing_type", filters.listing_type);
      if (filters.min_price) params.append("min_price", filters.min_price);
      if (filters.max_price) params.append("max_price", filters.max_price);
      if (filters.condition) params.append("condition", filters.condition);
      if (filters.location) params.append("location", filters.location);
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = queryString ? `${API_URL}?${queryString}` : API_URL;

      const response = await axios.get(url);
      set({ products: response.data.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching products",
        isLoading: false,
      });
    }
  },

  // Fetch single product
  fetchProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ currentProduct: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching product",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch user's own listings
  fetchMyListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/my/listings`);
      set({ myListings: response.data.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching listings",
        isLoading: false,
      });
    }
  },

  // Create a new product listing (supports FormData for file uploads)
  createProduct: async (productData, imageFiles = []) => {
    set({ isLoading: true, error: null });
    try {
      let response;
      
      if (imageFiles.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Append text fields
        Object.keys(productData).forEach(key => {
          if (productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key]);
          }
        });
        
        // Append image files
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        response = await axios.post(API_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // No files, use regular JSON
        response = await axios.post(API_URL, productData);
      }
      
      set((state) => ({
        myListings: [response.data.data, ...state.myListings],
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error creating product",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/${id}`, productData);
      set((state) => ({
        myListings: state.myListings.map((p) =>
          p.id === id ? response.data.data : p
        ),
        currentProduct:
          state.currentProduct?.id === id
            ? response.data.data
            : state.currentProduct,
        isLoading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating product",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        myListings: state.myListings.filter((p) => p.id !== id),
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error deleting product",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      set({ categories: response.data.data });
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  },

  // Fetch dashboard statistics for the logged-in user
  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      set({ dashboardStats: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching dashboard stats",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear current product
  clearCurrentProduct: () => set({ currentProduct: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
