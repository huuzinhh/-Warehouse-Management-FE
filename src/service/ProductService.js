import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const ProductService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.product.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create Product error:", error);
      throw error;
    }
  },

  update: async (id, request) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.product.update(id),
        request
      );
      return response.result;
    } catch (error) {
      console.error("Update Product error:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.product.getAll);
      return response.result;
    } catch (error) {
      console.error("Get Product error:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.product.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get Product by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.product.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete Product error:", error);
      throw error;
    }
  },

  getInventory: async () => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.product.getInventory
      );
      return response.result;
    } catch (error) {
      console.error("Get inventory error:", error);
      throw error;
    }
  },
};

export default ProductService;
