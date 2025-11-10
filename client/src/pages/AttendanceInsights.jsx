import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

export default function AttendanceInsights() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    avgMonthlyAttendance: "-",
    highestMonth: "-",
    avgAbsencesPerStudent: "-",
    peakAbsenceDay: "-",
    monthlyTrend: [],
    weekdayPattern: [],
    reasonBreakdown: [],
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/reports/attendance-insights`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInsights(res.data.data);
      } catch (err) {
        console.error("Failed to load attendance insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [token]);

  const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#9333ea", "#06b6d4"];

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Insights</h1>
          <p className="text-neutral-600 mt-1">
            Track student attendance trends and patterns.
          </p>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Avg Monthly Attendance</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : `${insights.avgMonthlyAttendance}%`}
            </h2>
          </div>
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Highest Attendance Month</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : insights.highestMonth}
            </h2>
          </div>
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Average Absences/Student</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : `${insights.avgAbsencesPerStudent} days`}
            </h2>
          </div>
          <div className="bg-white border p-5 rounded-xl shadow-sm">
            <p className="text-neutral-500 text-sm">Peak Absence Day</p>
            <h2 className="text-2xl font-bold mt-1">
              {loading ? "..." : insights.peakAbsenceDay}
            </h2>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Monthly Attendance Trend */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Monthly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={insights.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekday Pattern */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Weekday Attendance Pattern</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={insights.weekdayPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="absences" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Absence Reason Breakdown */}
          <div className="bg-white border rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Absence Reasons Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={insights.reasonBreakdown}
                  dataKey="count"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {insights.reasonBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
