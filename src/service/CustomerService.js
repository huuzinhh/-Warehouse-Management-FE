import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../config/apiConfig";
import { setToken, clearStorage } from "./localStorageService";
import create from "@ant-design/icons/lib/components/IconFont";

const CustomerService = {
    /** Tạo khách hàng mới */
    createCustomer: async (customerData) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.customer.create, customerData);
            return response.data;
        } catch (error) {
            console.error("Create customer service error:", error);
            throw error;
        }
    }
}