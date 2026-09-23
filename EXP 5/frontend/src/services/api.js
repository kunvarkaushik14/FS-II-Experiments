import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// =====================================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token to every API request
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Correlation ID
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      config.headers["X-Correlation-ID"] = crypto.randomUUID();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response) {
      const status = error.response.status;

      // JWT expired/invalid
      if (status === 401) {
        console.warn("Authentication expired. Logging out.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("auth:logout"));
      }

      // User is logged in but does not have permission
      if (status === 403) {
        console.warn(
          "Access forbidden. The logged-in user may not have permission."
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;