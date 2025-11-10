import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Card from "../components/Card.jsx";
import StatBadge from "../components/StatBadge.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import OutlineButton from "../components/OutlineButton.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Utensils,
  BarChart2,
  ClipboardList,
  FilePieChart,
} from "lucide-react";

export default function MessManagerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgMealRating: "-",
    absenceRequests: "-",
    weeklyMenus: "-",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/reports/manager-dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch manager stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mess Manager Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Manage weekly menus, view analytics, and monitor student engagement.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatBadge
            label="Avg Meal Rating"
            value={loading ? "..." : stats.avgMealRating}
            icon={<BarChart2 className="h-5 w-5" />}
          />
          <StatBadge
            label="Absence Requests"
            value={loading ? "..." : stats.absenceRequests}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatBadge
            label="Weekly Menu Cycles"
            value={loading ? "..." : stats.weeklyMenus}
            icon={<Utensils className="h-5 w-5" />}
          />
        </section>

        {/* Main Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Menu Management */}
          <Card
            icon={<Utensils />}
            title="Weekly Menu Management"
            description="Post or update weekly menu plans for students."
            actions={
              <PrimaryButton onClick={() => navigate("/manage-menus")}>
                Manage Menus
              </PrimaryButton>
            }
          />

          {/* Feedback & Analytics */}
          <Card
            icon={<BarChart2 />}
            title="Feedback Analytics"
            description="View consolidated feedback and meal-wise ratings."
            actions={
              <PrimaryButton onClick={() => navigate("/feedback-analytics")}>
                View Analytics
              </PrimaryButton>
            }
          />

          {/* Attendance Tracking */}
          <Card
            icon={<ClipboardList />}
            title="Attendance Insights"
            description="Track student attendance trends and patterns."
            actions={
              <PrimaryButton onClick={() => navigate("/attendance-insights")}>
                View Attendance
              </PrimaryButton>
            }
          />

          {/* Reports */}
          <Card
            icon={<FilePieChart />}
            title="Feedback Reports"
            description="Download monthly or weekly feedback reports."
            actions={
              <OutlineButton onClick={() => navigate("/feedback-reports")}>
                Generate Report
              </OutlineButton>
            }
          />
        </section>
      </main>
    </div>
  );
}
