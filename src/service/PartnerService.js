import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const PartnerService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.partner.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create partner error:", error);
      throw error;
    }
  },

  update: async (id, request) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.partner.update(id), // ✅ đúng
        request
      );
      return response.result;
    } catch (error) {
      console.error("Update partner error:", error);
      throw error;
    }
  },

  getAll: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.partner.getAll);
    return response.result;
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.partner.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get partner by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.partner.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete partner error:", error);
      throw error;
    }
  },
};

export default PartnerService;
