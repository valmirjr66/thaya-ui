import axios from "axios";

const API_ADDRESS = import.meta.env.VITE_API_URL;
console.log("API_ADDRESS", API_ADDRESS);
console.log("API_ADDRESS1", process.env.VITE_API_URL);

export const DEFAULT_HTTP_CONFIG = {
  headers: {
    "x-user-email": localStorage.getItem("userEmail"),
    "x-user-chat-origin": "ui",
  },
};

const axiosInstance = axios.create({ baseURL: API_ADDRESS });

const httpCallers = {
  get: async (path: string) => {
    return await axiosInstance.get(path, DEFAULT_HTTP_CONFIG);
  },
  post: async <T>(path: string, data?: T) => {
    return await axiosInstance.post(path, data, DEFAULT_HTTP_CONFIG);
  },
  put: async <T>(path: string, data?: T) => {
    return await axiosInstance.put(path, data, DEFAULT_HTTP_CONFIG);
  },
  patch: async <T>(path: string, data?: T) => {
    return await axiosInstance.patch(path, data, DEFAULT_HTTP_CONFIG);
  },
  delete: async (path: string) => {
    return await axiosInstance.delete(path, DEFAULT_HTTP_CONFIG);
  },
};

export default httpCallers;
