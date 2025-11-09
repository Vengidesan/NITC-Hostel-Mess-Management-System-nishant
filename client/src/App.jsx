import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import RedirectToDashboard from "./components/RedirectToDashboard.jsx";

import StudentDashboard from "./pages/StudentDashboard.jsx";
import MessManagerDashboard from "./pages/MessManagerDashboard.jsx";
import HostelAdminDashboard from "./pages/HostelAdminDashboard.jsx";
import Feedback from "./pages/Feedback.jsx";
import Menu from "./pages/Menu.jsx";
import ViewBills from "./pages/ViewBills.jsx";
import Attendance from "./pages/Attendance.jsx";
import ManageMenus from "./pages/ManageMenus.jsx";
import FeedbackAnalytics from "./pages/FeedbackAnalytics.jsx";
import PaymentRecords from "./pages/PaymentRecords.jsx";
import GenerateBills from "./pages/GenerateBills.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Root: redirect intelligently */}
      <Route path="/" element={<RedirectToDashboard />} />

      {/* Signin / Signup */}
      <Route
        path="/signin"
        element={
          user && token ? (
            <RedirectToDashboard />
          ) : (
            <SignIn />
          )
        }
      />
      <Route
        path="/signup"
        element={
          user && token ? (
            <RedirectToDashboard />
          ) : (
            <SignUp />
          )
        }
      />

      {/* Protected (Authenticated users only) */}
      <Route element={<ProtectedRoute />}>
        {/* Student-only */}
        <Route element={<RoleProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/bills" element={<ViewBills />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>

        {/* Manager-only */}
        <Route element={<RoleProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<MessManagerDashboard />} />
          <Route path="/manage-menus" element={<ManageMenus />} />
          <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
          <Route path="/payment-records" element={<PaymentRecords />} />
        </Route>

        {/* Admin-only */}
        <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<HostelAdminDashboard />} />
          <Route path="/generate-bills" element={<GenerateBills />} />
          <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
          <Route path="/payment-records" element={<PaymentRecords />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={<h1 className="p-8 text-2xl">404 • Page not found</h1>}
      />
    </Routes>
  );
}
