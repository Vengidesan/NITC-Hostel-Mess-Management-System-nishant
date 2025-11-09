import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Card from "../components/Card.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import OutlineButton from "../components/OutlineButton.jsx";
import StatBadge from "../components/StatBadge.jsx";
import {
  Utensils,
  Star,
  ClipboardList,
  ReceiptIndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getMyAttendance } from "../api/attendanceAPI.js";

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    mealsThisMonth: "-",
    avgRating: "-",
    pendingBill: "-",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) return;

      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // 🔹 1. Attendance Summary (for meals this month)
        const attendanceRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/attendance/summary`,
          {
            params: { month, year },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mealsThisMonth = attendanceRes.data?.data?.presentDays || 0;
        console.log(mealsThisMonth)

        // 🔹 2. Feedback average rating
        const feedbackRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/feedback/my-ratings`,
          { headers }
        );
        const avgRating =
          feedbackRes.data?.averageRating?.toFixed(1) ||
          feedbackRes.data?.data?.avgRating ||
          0;

        // 🔹 3. Pending bill
        const billsRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/bills/my-bills`,
          {
            params: { paymentStatus: "unpaid", limit: 1 },
            headers,
          }
        );

        const pendingBill =
          billsRes.data?.data?.[0]?.amountDue ||
          billsRes.data?.data?.[0]?.totalAmount ||
          0;

        setStats({
          mealsThisMonth,
          avgRating,
          pendingBill,
        });
      } catch (error) {
        console.error("Dashboard Data Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Greeting */}
        <section className="mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Student Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your meals, feedback, attendance, and payments — all in
                one place.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <OutlineButton>Help</OutlineButton>
              <PrimaryButton onClick={() => navigate("/menu")}>
                Open Menu
              </PrimaryButton>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatBadge
            label="Meals this month"
            value={loading ? "..." : stats.mealsThisMonth}
            icon={<Utensils className="h-5 w-5" />}
          />
          <StatBadge
            label="Avg rating given"
            value={loading ? "..." : stats.avgRating}
            icon={<Star className="h-5 w-5" />}
          />
          <StatBadge
            label="Pending bill"
            value={loading ? "..." : `₹${stats.pendingBill}`}
            icon={<ReceiptIndianRupee className="h-5 w-5" />}
          />
        </section>

        {/* Core Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card
            icon={<Utensils />}
            title="Menu"
            description="View weekly meals"
            actions={
              <PrimaryButton onClick={() => navigate("/menu")}>
                Open Menu
              </PrimaryButton>
            }
          />
          <Card
            icon={<Star />}
            title="Feedback"
            description="Rate and comment meals"
            actions={
              <PrimaryButton onClick={() => navigate("/feedback")}>
                Give Feedback
              </PrimaryButton>
            }
          />
          <Card
            icon={<ClipboardList />}
            title="Attendance"
            description="Mark absence and view history"
            actions={
              <PrimaryButton onClick={() => navigate("/attendance")}>
                Attendance
              </PrimaryButton>
            }
          />
          <Card
            icon={<ReceiptIndianRupee />}
            title="Bills & Payments"
            description="Check dues and pay securely via UPI, card, or netbanking."
            actions={
              <div className="flex gap-3">
                <OutlineButton onClick={() => navigate("/bills")}>
                  View Bills
                </OutlineButton>
                <PrimaryButton>Pay Now</PrimaryButton>
              </div>
            }
          />
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} NITC Mess. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
