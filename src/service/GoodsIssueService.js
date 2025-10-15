import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const GoodsIssuseService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.goodsissue.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create Goods Issue error:", error);
      throw error;
    }
  },

  getAll: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.goodsissue.getAll);
    return response.result;
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.goodsissue.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get Goods Issue by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.goodsissue.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete Goods Issue error:", error);
      throw error;
    }
  },

  cancelGoods: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.goodsissue.cancelGoods,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Cancel Goods Issue error:", error);
      throw error;
    }
  },
};

export default GoodsIssuseService;
