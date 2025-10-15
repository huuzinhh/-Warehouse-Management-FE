export const API_BASE_URL = "http://localhost:8080";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
  },

  product: {
    create: "/api/products",
    update: (id) => `/api/products/${id}`,
    getById: (id) => `/api/products/${id}`,
    getAll: "/api/products",
    delete: (id) => `/api/products/${id}`,
    toggle: (id) => `/api/products/toggle/${id}`,

    getInventory: "/api/inventory-batches",
    getInventoryByProductId: (productId) =>
      `/api/inventory-batches/product/${productId}`,
  },

  category: {
    create: "/api/categories",
    update: (id) => `/api/categories/${id}`,
    getById: (id) => `/api/categories/${id}`,
    getAll: "/api/categories",
    delete: (id) => `/api/categories/${id}`,
    toggle: (id) => `/api/categories/toggle/${id}`,
  },

  location: {
    create: "/api/locations",
    update: (id) => `/api/locations/${id}`,
    getById: (id) => `/api/locations/${id}`,
    getAll: "/api/locations",
    delete: (id) => `/api/locations/${id}`,
  },

  partner: {
    create: "/api/partners",
    update: (id) => `/api/partners/${id}`,
    getById: (id) => `/api/partners/${id}`,
    getAll: "/api/partners",
    delete: (id) => `/api/partners/${id}`,
  },

  goodsreceipt: {
    create: "/api/goods-receipts",
    getById: (id) => `/api/goods-receipts/${id}`,
    getAll: "/api/goods-receipts",
    delete: (id) => `/api/goods-receipts/${id}`,
  },

  goodsissue: {
    create: "/api/goods-issues",
    getById: (id) => `/api/goods-issues/${id}`,
    getAll: "/api/goods-issues",
    delete: (id) => `/api/goods-issues/${id}`,
    cancelGoods: "/api/goods-issues/cancel",
  },
};
