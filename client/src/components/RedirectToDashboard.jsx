import React from "react";
import { Navigate } from "react-router-dom";

export default function RedirectToDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  if (user && token) {
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
  }

  // If not logged in, go to sign-in
  return <Navigate to="/signin" replace />;
}
