import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true, // ✅ Gửi cookie
});

export default axiosInstance;
