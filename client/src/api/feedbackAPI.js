// src/api/feedbackApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/feedback", // change if your backend base differs
  withCredentials: true,
});

// Attach token from localStorage.token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

/* Student */
export const submitFeedback = (payload) => API.post("/", payload);
export const getMyFeedback = (params) => API.get("/my-feedback", { params });
export const updateFeedback = (id, payload) => API.put(`/${id}`, payload);
export const deleteFeedback = (id) => API.delete(`/${id}`);

/* Manager/Admin */
export const getConsolidatedFeedback = (params) =>
  API.get("/consolidated", { params }); // expects ?messId=&month=&year=
export const getMessFeedbacks = (params) => API.get("/mess", { params });
export const getPendingFeedbacks = (params) => API.get("/pending", { params });
export const addManagerResponse = (id, payload) => API.put(`/${id}/respond`, payload);
export const updateFeedbackStatus = (id, payload) => API.put(`/${id}/status`, payload);

/* Voting */
export const upvoteFeedback = (id) => API.put(`/${id}/upvote`);
export const removeUpvote = (id) => API.delete(`/${id}/upvote`);

/* Stats */
export const getFeedbackStatistics = (params) => API.get("/statistics", { params });

export default API;
