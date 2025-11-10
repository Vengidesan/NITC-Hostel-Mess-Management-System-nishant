import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🔹 Core utilities and guards
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import RedirectToDashboard from "./components/RedirectToDashboard.jsx";

// 🔹 Authentication pages
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";

// 🔹 Student pages
import StudentDashboard from "./pages/StudentDashboard.jsx";
import Menu from "./pages/Menu.jsx";
import Attendance from "./pages/Attendance.jsx";
import ViewBills from "./pages/ViewBills.jsx";
import Feedback from "./pages/Feedback.jsx";
import Help from "./pages/Help.jsx";
import MarkAbsence from "./pages/MarkAbsence.jsx";
import PayNow from "./pages/PayNow.jsx";
import PayPendingBills from "./pages/PayPendingBills.jsx";

// 🔹 Manager pages
import MessManagerDashboard from "./pages/MessManagerDashboard.jsx";
import ManageMenus from "./pages/ManageMenus.jsx";
import FeedbackAnalytics from "./pages/FeedbackAnalytics.jsx";
import PaymentRecords from "./pages/PaymentRecords.jsx";
import AttendanceInsights from "./pages/AttendanceInsights.jsx";
import FeedbackReports from "./pages/FeedbackReports.jsx";

// 🔹 Admin pages
import HostelAdminDashboard from "./pages/HostelAdminDashboard.jsx";
import GenerateBills from "./pages/GenerateBills.jsx";
import SystemReports from "./pages/SystemReports.jsx";
import UserRoles from "./pages/UserRoles.jsx";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Root redirection */}
      <Route path="/" element={<RedirectToDashboard />} />

      {/* 🔐 Auth pages */}
      <Route
        path="/signin"
        element={
          user && token ? <RedirectToDashboard /> : <SignIn />
        }
      />
      <Route
        path="/signup"
        element={
          user && token ? <RedirectToDashboard /> : <SignUp />
        }
      />

      {/* 🔒 Protected Routes (Authenticated Users Only) */}
      <Route element={<ProtectedRoute />}>
        {/* 🧑‍🎓 Student Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/bills" element={<ViewBills />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/help" element={<Help />} />
          <Route path="/mark-absence" element={<MarkAbsence />} />
          <Route path="/pay-now" element={<PayNow />} />
          <Route path="/pay-pending-bills" element={<PayPendingBills />} />
        </Route>

        {/* 👨‍🍳 Manager Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["manager"]} />}>
          <Route path="/manager" element={<MessManagerDashboard />} />
          <Route path="/manage-menus" element={<ManageMenus />} />
          <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
          {/* <Route path="/payment-records" element={<PaymentRecords />} /> */}
          <Route path="/attendance-insights" element={<AttendanceInsights />} />
          <Route path="/feedback-reports" element={<FeedbackReports />} />
        </Route>

        {/* 🧑‍💼 Admin Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<HostelAdminDashboard />} />
          <Route path="/generate-bills" element={<GenerateBills />} />
          <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
          <Route path="/payment-records" element={<PaymentRecords />} />
          <Route path="/system-reports" element={<SystemReports />} />
          <Route path="/user-roles" element={<UserRoles />} />
        </Route>
      </Route>

      {/* ❌ 404 Fallback */}
      <Route
        path="*"
        element={<h1 className="p-8 text-2xl">404 • Page not found</h1>}
      />
    </Routes>
  );
}
