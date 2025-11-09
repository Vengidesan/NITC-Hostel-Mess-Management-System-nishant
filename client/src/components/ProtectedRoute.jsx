import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // If no token or user, redirect to sign-in
  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}
