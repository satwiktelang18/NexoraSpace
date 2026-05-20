import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const currentPath = window.location.pathname;

    // ONLY logout if token is expired on protected pages
    if (
      error.response?.status === 401 &&
      !currentPath.includes("/login") &&
      !currentPath.includes("/register")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);