import React from "react";
import {
  Home,
  Utensils,
  Star,
  ClipboardList,
  ReceiptIndianRupee,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // 🌟 Determine dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return "/signin";
    if (user.role === "student") return "/student";
    if (user.role === "manager") return "/manager";
    if(user.role==="admin") return "/admin";
    return "/signin";
  };

  // 🔹 Navigation items (dynamic for dashboard)
  const NAV = [
    { icon: Home, label: "Dashboard", path: getDashboardPath() },
    { icon: Utensils, label: "Menu", path: "/menu" },
    { icon: Star, label: "Feedback", path: "/feedback" },
    { icon: ClipboardList, label: "Attendance", path: "/attendance" },
    { icon: ReceiptIndianRupee, label: "Bills & Payments", path: "/bills" },
  ];

  // 🔒 Logout logic
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert("You have been logged out successfully!");
      navigate("/signin");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-200 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white/70 backdrop-blur-md border-r border-neutral-200 shadow-soft transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-5 border-b border-neutral-200">
          <span className="text-sm font-medium text-primary bg-accent px-2 py-1 rounded-md">
            NITC Mess
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3">
          <ul className="space-y-1">
            {NAV.map(({ icon: Icon, label, path }) => (
              <li key={label}>
                <Link
                  to={path}
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/70 text-left transition"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Manager/Admin-only links */}
          <div className="mt-4 pt-4 border-t border-neutral-200/70">
            {user?.role !== "student" && (
              <Link
                to="/analytics"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/70 text-left transition"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Feedback Analytics</span>
              </Link>
            )}

            {/* Settings */}
            <Link
              to="/settings"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/70 text-left transition"
            >
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Settings</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/70 text-left transition"
            >
              <LogOut className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
