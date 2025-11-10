import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PayNow() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const upiId = "nitcmess@oksbi";
  const token = localStorage.getItem("token");

  // 🚫 Prevent duplicate navigation
  const navigatedRef = useRef(false);

  useEffect(() => {
    const storedBills = JSON.parse(sessionStorage.getItem("selectedBills") || "[]");

    // ✅ Handle "no bills selected" gracefully
    if (storedBills.length === 0 && !navigatedRef.current) {
      navigatedRef.current = true; // Prevent duplicate redirect
      alert("⚠️ No bills selected for payment.");
      navigate("/bills", { replace: true });
      return;
    }

    setBills(storedBills);
    setLoading(false);
  }, [navigate]);

  const totalAmount = bills.reduce((sum, b) => sum + (b.amountDue || b.totalAmount || 0), 0);

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId);
    alert("✅ UPI ID copied!");
  };

  const handlePaymentConfirm = async () => {
    if (!bills.length) return;

    try {
      const billIds = bills.map((b) => b._id);
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/bills/mark-paid`,
        {
          billIds,
          paymentMethod: "upi",
          transactionId: `UPI-${Date.now()}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Payment recorded successfully!");
      sessionStorage.removeItem("selectedBills");
      navigate("/bills");
    } catch (error) {
      console.error("Payment Error:", error);
      alert("❌ Failed to record payment. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-lg font-medium">
        Loading payment details...
      </div>
    );

  // ✅ Extra safety — if bills become empty somehow
  if (!bills.length)
    return (
      <div className="h-screen flex items-center justify-center text-lg text-neutral-600">
        No bills selected for payment.
      </div>
    );

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pay Now</h1>
          <p className="text-neutral-600 mt-1">
            Complete your payment using UPI. Your transaction will be processed securely.
          </p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm max-w-xl mx-auto">
          {/* Selected Bills */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Selected Bills</h2>
            <div className="space-y-2">
              {bills.map((bill) => (
                <div
                  key={bill._id}
                  className="flex justify-between text-sm border-b pb-1 text-neutral-700"
                >
                  <span>
                    {bill.month || "Unknown"} / {bill.year}
                  </span>
                  <span>₹{bill.amountDue || bill.totalAmount || 0}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 font-semibold text-blue-700 text-right">
              Total: ₹{totalAmount}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="p-3 border rounded-xl">
              <img
                src="/src/assets/upi-qr.png"
                alt="UPI QR Code"
                className="h-48 w-48 object-contain"
              />
            </div>
          </div>

          {/* UPI ID */}
          <div className="mb-6">
            <label className="text-sm font-medium text-neutral-700">UPI ID</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={upiId}
                disabled
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 text-sm"
              />
              <button
                onClick={copyUPI}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Use this UPI ID if the QR code isn’t scanning.
            </p>
          </div>

          {/* Confirm Payment */}
          <button
            className="w-full py-3 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700"
            onClick={handlePaymentConfirm}
          >
            ✅ I Have Paid
          </button>

          <p className="text-center text-xs text-neutral-500 mt-3">
            *Payment will be verified by the Mess Office.
          </p>
        </div>
      </main>
    </div>
  );
}
