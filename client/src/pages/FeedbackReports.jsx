import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function FeedbackReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reportType, setReportType] = useState("monthly");
  const [month, setMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");

  const handleGenerate = () => {
    if (reportType === "monthly" && !month) {
      alert("Please select a month to generate the report.");
      return;
    }
    if (reportType === "weekly" && !weekStart) {
      alert("Please select a week start date.");
      return;
    }

    // Placeholder for backend call
    alert(`✅ ${reportType === "monthly" ? `Monthly report for ${month}` : `Weekly report starting ${weekStart}`} generated!`);
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Feedback Reports</h1>
          <p className="text-neutral-600 mt-1">
            Download monthly or weekly feedback reports.
          </p>
        </header>

        {/* Content Card */}
        <section className="bg-white border p-6 rounded-xl shadow-sm w-full max-w-2xl">
          
          {/* Report Type */}
          <div className="mb-5">
            <label className="text-sm font-medium text-neutral-700">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            >
              <option value="monthly">Monthly Report</option>
              <option value="weekly">Weekly Report</option>
            </select>
          </div>

          {/* Month Selector */}
          {reportType === "monthly" && (
            <div className="mb-5">
              <label className="text-sm font-medium text-neutral-700">Select Month</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {/* Week Selector */}
          {reportType === "weekly" && (
            <div className="mb-5">
              <label className="text-sm font-medium text-neutral-700">Select Week Start Date</label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-xs text-neutral-500 mt-1">
                The report will include the 7 days starting from this date.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg mt-4"
          >
            Generate Report
          </button>
        </section>
      </main>
    </div>
  );
}
