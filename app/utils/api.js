import axios from "axios";
// You can set the base URL once
const api = axios.create({
  baseURL: "/api", // all requests will be relative to /api
  headers: { "Content-Type": "application/json" },
});

export default api;
