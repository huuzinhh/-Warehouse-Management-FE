import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const GoodsReceiptService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.goodsreceipt.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create Goods Receipt error:", error);
      throw error;
    }
  },

  getAll: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.goodsreceipt.getAll);
    return response.result;
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.goodsreceipt.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get Goods Receipt by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.goodsreceipt.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete Goods Receipt error:", error);
      throw error;
    }
  },
};

export default GoodsReceiptService;
