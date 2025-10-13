// src/utils/axiosInstance.js
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import toastService from "../service/ToastService";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const getAccessToken = () => localStorage.getItem("accessToken");

// Gắn token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response & lỗi
axiosInstance.interceptors.response.use(
  (response) => {
    const apiResponse = response.data;
    // Hiển thị toast thành công cho các method không phải GET
    if (apiResponse?.message && response.config.method !== "get") {
      toastService.success(apiResponse.message);
    }
    
    return apiResponse;
  },
  (error) => {
    const status = error.response?.status;
    const apiResponse = error.response?.data;

    // Hiển thị message lỗi từ server nếu có
    if (apiResponse?.message) {
      toastService.error(apiResponse.message);
      return Promise.reject(apiResponse);
    }

    // Xử lý các lỗi cụ thể
    if (status === 401) {
      toastService.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      localStorage.removeItem("accessToken");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } else if (status === 403) {
      toastService.error("Bạn không có quyền truy cập tính năng này!");
    } else if (status === 404) {
      toastService.error("Không tìm thấy tài nguyên!");
    } else if (status >= 500) {
      toastService.error("Lỗi server. Vui lòng thử lại sau!");
    } else {
      toastService.error("Không thể kết nối đến server. Vui lòng thử lại sau!");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;