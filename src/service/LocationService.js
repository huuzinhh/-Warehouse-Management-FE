import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const LocationService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.location.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create location error:", error);
      throw error;
    }
  },

  getAll: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.location.getAll);
    return response.result;
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.location.getById(id)
      );
      return response.result;
    } catch (error) {
      console.error("Get location by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.location.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete location error:", error);
      throw error;
    }
  },
};

export default LocationService;
