import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Card from "../components/Card.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import OutlineButton from "../components/OutlineButton.jsx";
import StatBadge from "../components/StatBadge.jsx";
import { Utensils, Star, ClipboardList, ReceiptIndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    mealsThisMonth: 0,
    avgRating: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/reports/student-dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data.data);
      } catch (error) {
        console.error("Error fetching student stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Greeting */}
        <section className="mb-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
              <p className="text-neutral-600 mt-1">
                Manage your meals, feedback, attendance, and payments — all in one place.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <OutlineButton onClick={() => navigate("/help")}>Help</OutlineButton>
              <PrimaryButton onClick={() => navigate("/menu")}>Open Menu</PrimaryButton>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {loading ? (
          <p className="text-center text-neutral-500 my-8">Loading your data...</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <StatBadge
              label="Meals this month"
              value={stats.mealsThisMonth}
              icon={<Utensils className="h-5 w-5" />}
            />
            <StatBadge
              label="Avg rating given"
              value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
              icon={<Star className="h-5 w-5" />}
            />
            <StatBadge
              label="Pending bill"
              value={`₹${stats.pendingAmount}`}
              icon={<ReceiptIndianRupee className="h-5 w-5" />}
            />
          </section>
        )}

        {/* Core Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card
            icon={<Utensils />}
            title="Menu"
            description="View weekly meals"
            actions={<PrimaryButton onClick={() => navigate("/menu")}>Open Menu</PrimaryButton>}
          />
          <Card
            icon={<Star />}
            title="Feedback"
            description="Rate and comment meals"
            actions={<PrimaryButton onClick={() => navigate("/feedback")}>Give Feedback</PrimaryButton>}
          />
          <Card
            icon={<ClipboardList />}
            title="Attendance"
            description="Mark absence and view history"
            actions={<PrimaryButton onClick={() => navigate("/attendance")}>Attendance</PrimaryButton>}
          />
          <Card
            icon={<ReceiptIndianRupee />}
            title="Bills & Payments"
            description="Check dues and pay securely via UPI, card, or netbanking."
            actions={
              <div className="flex gap-3">
                <OutlineButton onClick={() => navigate("/bills")}>View Bills</OutlineButton>
                <PrimaryButton onClick={() => navigate("/pay-now")}>Pay Now</PrimaryButton>
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
