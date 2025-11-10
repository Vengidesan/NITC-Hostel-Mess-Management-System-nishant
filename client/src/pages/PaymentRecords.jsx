import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";

export default function PaymentRecords() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "all",
  });

  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/reports/payments`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filter,
        }
      );
      setPayments(res.data.data);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filter.month, filter.year, filter.status]);

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Payment Records</h1>
          <p className="text-neutral-600 mt-1">
            Review all student bill payments and their transaction details.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-5xl mx-auto mb-8">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800">
            Filters
          </h2>
          <div className="flex flex-wrap gap-3">
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: e.target.value })}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <button
              onClick={fetchPayments}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Records Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-5xl mx-auto">
          {loading ? (
            <p className="text-center text-neutral-500 py-8">
              Loading payment records...
            </p>
          ) : payments.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">
              No payment records found for selected filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-neutral-100 border-b text-neutral-700">
                  <tr>
                    <th className="p-3 text-left">Student</th>
                    <th className="p-3 text-left">Month</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Paid</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Transaction ID</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b hover:bg-blue-50 transition"
                    >
                      <td className="p-3">
                        {p.studentId?.name || "Unknown"}
                        <div className="text-xs text-neutral-500">
                          {p.studentId?.registrationNumber || "—"}
                        </div>
                      </td>
                      <td className="p-3">
                        {new Date(0, p.month - 1).toLocaleString("default", {
                          month: "short",
                        })}{" "}
                        {p.year}
                      </td>
                      <td className="p-3 font-medium text-neutral-800">
                        ₹{p.totalAmount}
                      </td>
                      <td className="p-3 text-green-700 font-semibold">
                        ₹{p.amountPaid}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            p.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : p.paymentStatus === "partially_paid"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.paymentStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.paymentHistory?.[p.paymentHistory.length - 1]
                          ?.paymentMethod || "—"}
                      </td>
                      <td className="p-3 text-xs">
                        {p.paymentHistory?.[p.paymentHistory.length - 1]
                          ?.transactionId || "—"}
                      </td>
                      <td className="p-3 text-xs">
                        {p.paymentHistory?.[p.paymentHistory.length - 1]
                          ?.paymentDate
                          ? new Date(
                              p.paymentHistory[p.paymentHistory.length - 1]
                                .paymentDate
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6">
          *All payments are automatically verified by the system and can be
          cross-checked with UPI or bank records.
        </p>
      </main>
    </div>
  );
}
