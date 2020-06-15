import axios from "axios";
console.log(process.env.REACT_APP_API_PATH);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_PATH || "http://localhost:3333",
});
export default api;
