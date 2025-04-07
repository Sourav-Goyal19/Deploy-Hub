import axios from "axios";
import Cookies from "js-cookie";
import { deleteCookies, setCookies } from "./utils";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axiosInstance.get("/api/auth/refresh", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      withCredentials: true,
    });

    setCookies(response.data.accessToken, refreshToken);
    return response.data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        Cookies.set("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
