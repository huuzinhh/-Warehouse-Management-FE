import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const CategoryService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.category.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create category error:", error);
      throw error;
    }
  },

  update: async (id, request) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.category.update(id),
        request
      );
      return response.result;
    } catch (error) {
      console.error("Update category error:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.category.getAll);
      return response.result;
    } catch (error) {
      console.error("Get category error:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.category.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get category by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.category.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  },

  toggleActive: async (id) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.category.toggle(id)
      );
      return response.result;
    } catch (error) {
      console.error("Toggle category active status error:", error);
      throw error;
    }
  },
};

export default CategoryService;
