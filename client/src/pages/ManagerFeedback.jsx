// src/pages/ManagerFeedback.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import OutlineButton from "../components/OutlineButton.jsx";
import {
  getPendingFeedbacks,
  addManagerResponse,
  getMessFeedbacks,
} from "../api/feedbackApi.js";
import FeedbackItem from "../components/FeedBackItem.jsx";

export default function ManagerFeedback() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // feedback id
  const [responseText, setResponseText] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const loadPending = async () => {
    try {
      setLoading(true);
      const { data } = await getPendingFeedbacks();
      setFeedbacks(data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load pending feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleSelect = (fb) => {
    setSelected(fb);
    setResponseText("");
    setActionTaken("");
  };

  const handleRespond = async () => {
    if (!selected) return alert("Select a feedback to respond.");
    try {
      const payload = {
        response: responseText,
        actionTaken,
        status: "reviewed",
      };
      await addManagerResponse(selected._id, payload);
      alert("Response added.");
      // refresh list
      await loadPending();
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("Failed to respond: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pending Feedbacks</h1>
          <p className="text-neutral-600 mt-1">
            Respond to student feedback and record actions taken.
          </p>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : feedbacks.length === 0 ? (
          <p>No pending feedbacks.</p>
        ) : (
          <section className="grid gap-4">
            {feedbacks.map((fb) => (
              <div
                key={fb._id}
                className={`p-4 rounded-xl border ${
                  selected && selected._id === fb._id
                    ? "border-blue-400 bg-blue-50"
                    : "border-neutral-200 bg-white"
                }`}
                onClick={() => handleSelect(fb)}
              >
                <FeedbackItem feedback={fb} />
              </div>
            ))}
          </section>
        )}

        {selected && (
          <div className="mt-6 bg-white p-6 rounded-xl border border-neutral-200">
            <h3 className="text-lg font-semibold mb-2">Respond to selected feedback</h3>
            <textarea
              className="w-full rounded-lg border border-neutral-300 p-3 text-sm mb-3"
              rows="4"
              placeholder="Write your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-neutral-300 p-2 text-sm mb-3"
              placeholder="Action taken (optional)"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <OutlineButton onClick={() => setSelected(null)}>Cancel</OutlineButton>
              <PrimaryButton onClick={handleRespond}>Submit Response</PrimaryButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
