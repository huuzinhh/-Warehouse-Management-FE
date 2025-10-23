import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";

const UserService = {
  create: async (request) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.user.create,
        request
      );
      return response.result;
    } catch (error) {
      console.error("Create User error:", error);
      throw error;
    }
  },

  update: async (id, request) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.user.update(id),
        request
      );
      return response.result;
    } catch (error) {
      console.error("Update User error:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.user.getAll);
      return response.result;
    } catch (error) {
      console.error("Get User error:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.user.getById(id));
      return response.result;
    } catch (error) {
      console.error("Get User by ID error:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.user.delete(id)
      );
      return response.message;
    } catch (error) {
      console.error("Delete User error:", error);
      throw error;
    }
  },

  changeStatus: async (id) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.user.changeStatus(id)
      );
      return response.result;
    } catch (error) {
      console.error("Change User status error:", error);
      throw error;
    }
  },

  changePassword: async (id, request) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.user.changePassword(id),
        request
      );
      return response.result;
    } catch (error) {
      console.error("Change User password error:", error);
      throw error;
    }
  },
};

export default UserService;
