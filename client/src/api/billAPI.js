import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/bills", // your backend URL
  withCredentials: true,
});

// ✅ Attach JWT token from localStorage
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ----------------------------
// 🔹 Bill APIs
// ----------------------------
export const generateAllBills = (data) => API.post("/generate-all", data);
export const getMyBills = (params) => API.get("/my-bills", { params });
export const getBillById = (id) => API.get(`/${id}`);
export const addPayment = (id, data) => API.post(`/${id}/payment`, data);
export const getUnpaidBills = (messId) => API.get(`/unpaid/${messId}`);
export const getOverdueBills = (messId) => API.get(`/overdue/${messId}`);
export const getBillingSummary = (messId, month, year) =>
  API.get(`/summary/${messId}/${month}/${year}`);
