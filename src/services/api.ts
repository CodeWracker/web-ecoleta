import axios from "axios";

const api = axios.create({
  baseURL: process.env.MY_API_PATH || "http://localhost:3333",
});
export default api;
