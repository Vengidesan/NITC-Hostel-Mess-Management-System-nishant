import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PayPendingBills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // ✅ Fetch pending bills from backend
  useEffect(() => {
    const fetchPendingBills = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/bills/my-bills`,
          {
            params: { paymentStatus: "unpaid" },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBills(res.data?.data || []);
      } catch (error) {
        console.error("❌ Failed to fetch bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
  }, [token]);

  const toggleSelect = (billId) => {
    setSelected((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  const selectedBills = bills.filter((b) => selected.includes(b._id));
  const totalAmount = selectedBills.reduce((sum, b) => sum + (b.amountDue || b.totalAmount || 0), 0);

  const handleProceedToPay = () => {
    if (selectedBills.length === 0) return;
    // Save selected bills temporarily in sessionStorage
    sessionStorage.setItem("selectedBills", JSON.stringify(selectedBills));
    navigate("/pay-now");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading pending bills...
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Pay Pending Bills
          </h1>
          <p className="text-neutral-600 mt-1">
            Select the pending bills you want to pay and proceed with a secure payment.
          </p>
        </header>

        {/* Pending Bills List */}
        {bills.length > 0 ? (
          <section className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill._id}
                className={`flex items-center justify-between p-5 rounded-xl border shadow-sm cursor-pointer transition ${
                  selected.includes(bill._id)
                    ? "bg-blue-50 border-blue-400"
                    : "bg-white"
                }`}
                onClick={() => toggleSelect(bill._id)}
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {bill.month || "Unknown Month"} {bill.year || ""}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Amount Due: ₹{bill.amountDue || bill.totalAmount || 0}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={selected.includes(bill._id)}
                  onChange={() => toggleSelect(bill._id)}
                  className="h-5 w-5 accent-blue-600 cursor-pointer"
                />
              </div>
            ))}
          </section>
        ) : (
          <p className="mt-10 text-green-600 font-medium text-center">
            ✅ All bills are paid! No pending payments.
          </p>
        )}

        {/* Payment Footer */}
        {bills.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-lg font-semibold">
              Total:{" "}
              <span className="text-blue-700">
                ₹{totalAmount > 0 ? totalAmount : 0}
              </span>
            </div>

            <button
              disabled={selected.length === 0}
              onClick={handleProceedToPay}
              className={`px-6 py-3 rounded-lg text-white text-sm font-medium transition ${
                selected.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              Pay Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
