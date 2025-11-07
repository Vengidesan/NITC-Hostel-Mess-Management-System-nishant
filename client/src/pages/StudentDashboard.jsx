import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Card from "../components/Card.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import OutlineButton from "../components/OutlineButton.jsx";
import StatBadge from "../components/StatBadge.jsx";
import { Utensils, Star, ClipboardList, ReceiptIndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function StudentDashboard(){
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();


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
              <OutlineButton>Help</OutlineButton>
              <PrimaryButton onClick={() => navigate("/menu")}>Open Menu</PrimaryButton>
             
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatBadge label="Meals this month" value="24" icon={<Utensils className='h-5 w-5'/>} />
          <StatBadge label="Avg rating given" value="4.2" icon={<Star className='h-5 w-5'/>} />
          <StatBadge label="Pending bill" value="₹420" icon={<ReceiptIndianRupee className='h-5 w-5'/>} />
        </section>

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
                <OutlineButton onClick={()=>{navigate('/bills')}}>View Bills</OutlineButton>
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
