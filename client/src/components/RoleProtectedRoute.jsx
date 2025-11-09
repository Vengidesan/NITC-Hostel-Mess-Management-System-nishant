import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    // Redirect to their dashboard
    const redirectPath =
      user.role === "student"
        ? "/student"
        : user.role === "manager"
        ? "/manager"
        : "/admin";

    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
