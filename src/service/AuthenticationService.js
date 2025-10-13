import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";
import { setToken, clearStorage } from "./localStorageService";
import { message } from "antd";

const AuthService = {
  /** Đăng nhập */
  login: async (accountData) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.auth.login, accountData);
        console.log("response" ,response);

      const token = response?.result;
        console.log("token: ", token)
        
      if (!token) {
        throw new Error(response.data?.message || "Không nhận được token từ server");
      }

      setToken(token);
      return { accessToken: token };
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  /** Đăng xuất */
  logout: () => {
    try {
      clearStorage();
      // Có thể gọi API logout nếu backend có endpoint này
      // await api.post(API_ENDPOINTS.auth.logout);
      
      // Force reload để clear toàn bộ state
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout service error:", error);
      window.location.href = "/login";
    }
  }
}

export default AuthService;