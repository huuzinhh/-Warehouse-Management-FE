import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "accessToken";

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const decodeToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Lỗi decode JWT:", err);
    return null;
  }
};

export const getRolesFromToken = () => {
  const decoded = decodeToken();
  return decoded?.roles || [];
};

// Lấy username (sub)
export const getUsernameFromToken = () => {
  const decoded = decodeToken();
  return decoded?.sub || null;
};

// Lấy userId
export const getUserIdFromToken = () => {
  const decoded = decodeToken();
  return decoded?.userId || null;
};
