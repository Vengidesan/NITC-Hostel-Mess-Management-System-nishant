import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SystemReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgMealRating: 0,
    monthlyRevenue: 0,
    attendanceRate: 0,
  });
  const [ratingTrend, setRatingTrend] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSystemReports = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/reports/system`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data.data;

        setStats({
          totalStudents: data.totalStudents,
          avgMealRating: data.avgMealRating,
          monthlyRevenue: data.monthlyRevenue,
          attendanceRate: data.attendanceRate,
        });

        setRatingTrend(data.ratingTrend || []);
        setRevenueTrend(data.revenueTrend || []);
        setAttendanceTrend(data.attendanceTrend || []);
      } catch (err) {
        console.error("Error loading system reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemReports();
  }, [token]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-lg font-medium">
        Loading reports...
      </div>
    );

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">System Reports & Analytics</h1>
          <p className="text-neutral-600 mt-1">
            Access overall system insights and performance analytics.
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Total Students</p>
            <h2 className="text-2xl font-bold mt-1">{stats.totalStudents}</h2>
          </div>
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Average Meal Rating</p>
            <h2 className="text-2xl font-bold mt-1">{stats.avgMealRating?.toFixed(1)} ★</h2>
          </div>
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Monthly Revenue</p>
            <h2 className="text-2xl font-bold mt-1">
              ₹{(stats.monthlyRevenue / 100000).toFixed(2)} Lakh
            </h2>
          </div>
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Attendance This Month</p>
            <h2 className="text-2xl font-bold mt-1">{stats.attendanceRate}%</h2>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Meal Rating Trend */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Meal Rating Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgRating" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Pattern */}
          <div className="bg-white border rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Attendance & Absence Pattern</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#0284c7" />
                <Line type="monotone" dataKey="absence" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
