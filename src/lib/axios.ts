import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api", 
  withCredentials: true, // kalau butuh cookie/session
});

export default api;
