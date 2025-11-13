import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const AdjusmentService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.adjustment.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create category error:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.adjustment.getAll);
      return response.result;
    } catch (error) {
      console.error("Get category error:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.adjustment.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get category by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.adjustment.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  },

  exportExcel: () => {
    return axiosInstance.get(API_ENDPOINTS.adjustment.exportExcel, {
      responseType: "blob", // ⚠️ bắt buộc để nhận file nhị phân
    });
  },

  exportPdf: (id) => {
    return axiosInstance.get(API_ENDPOINTS.adjustment.exportPdf(id), {
      responseType: "blob", // nhận dạng file nhị phân
    });
  },
};

export default AdjusmentService;
