import axios from "axios";

const API_ADDRESS = import.meta.env.VITE_API_URL;

export const DEFAULT_HTTP_HEADERS = {};

const axiosInstance = axios.create({ baseURL: API_ADDRESS });

const httpCallers = {
  get: async (path: string) => {
    return await axiosInstance.get(path, { headers: DEFAULT_HTTP_HEADERS });
  },
  post: async <T>(path: string, data?: T) => {
    return await axiosInstance.post(path, data, {
      headers: DEFAULT_HTTP_HEADERS,
    });
  },
  put: async <T>(path: string, data?: T, headers?: Record<string, string>) => {
    return await axiosInstance.put(path, data, {
      headers: { ...DEFAULT_HTTP_HEADERS, ...headers },
    });
  },
  patch: async <T>(path: string, data?: T) => {
    return await axiosInstance.patch(path, data, {
      headers: DEFAULT_HTTP_HEADERS,
    });
  },
  delete: async (path: string) => {
    return await axiosInstance.delete(path, { headers: DEFAULT_HTTP_HEADERS });
  },
};

export default httpCallers;
