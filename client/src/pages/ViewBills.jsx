import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { getMyBills } from "../api/billApi.js";

export default function ViewBills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data } = await getMyBills();
        setBills(data.data);
      } catch (err) {
        console.error(err);
        alert("❌ Failed to fetch bills. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const hasPending = bills.some(
    (bill) => bill.paymentStatus !== "paid" && bill.paymentStatus !== "waived"
  );

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Bills & Payments</h1>
          <p className="text-neutral-600 mt-1">
            Your monthly mess bills and payment status.
          </p>
        </header>

        {loading ? (
          <p>Loading bills...</p>
        ) : bills.length === 0 ? (
          <p>No bills found.</p>
        ) : (
          <section className="space-y-4">
            {bills.map((bill, index) => (
              <div
                key={index}
                className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    {new Date(bill.billingPeriod.startDate).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <p className="text-neutral-600">
                    Total: ₹{bill.totalAmount} | Due: ₹{bill.amountDue}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bill.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : bill.paymentStatus === "overdue"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {bill.paymentStatus.replace("_", " ")}
                </span>
              </div>
            ))}
          </section>
        )}

        {hasPending && (
          <div className="mt-8 flex justify-end">
            <PrimaryButton>Pay Pending Bills</PrimaryButton>
          </div>
        )}
      </main>
    </div>
  );
}
