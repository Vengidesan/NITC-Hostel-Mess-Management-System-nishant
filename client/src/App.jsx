import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import ManagerFeedback from "./pages/ManagerFeedback.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/manager" element={<MessManagerDashboard />} />
      <Route path="/admin" element={<HostelAdminDashboard />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/bills" element={<ViewBills />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/manage-menus" element={<ManageMenus />} />
      <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
      <Route path="/payment-records" element={<PaymentRecords />} />
      <Route path="/generate-bills" element={<GenerateBills />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/manager/feedback" element={<ManagerFeedback />} />

      <Route
        path="*"
        element={<h1 className="p-8 text-2xl">404 • Page not found</h1>}
      />
    </Routes>
  );
}
