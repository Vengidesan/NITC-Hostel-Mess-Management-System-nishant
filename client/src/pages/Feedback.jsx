import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { Star } from "lucide-react";
import { submitFeedback } from "../api/feedbackAPI.js";
import axios from "axios";

export default function Feedback() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({});
  const [existingFeedbacks, setExistingFeedbacks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const meals = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
  ];

  const initial = meals.reduce((acc, m) => {
    acc[m.key] = { rating: 0, comment: "" };
    return acc;
  }, {});

  // ✅ Helper: get yesterday’s date (YYYY-MM-DD)
  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchYesterdayFeedback = async () => {
      try {
        const dateStr = getYesterdayDateString();

        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/feedback/my-feedback`,
          {
            params: {
              startDate: dateStr,
              endDate: dateStr,
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data?.data || [];
        setExistingFeedbacks(data);

        const updated = { ...initial };
        data.forEach((f) => {
          updated[f.mealType] = {
            rating: f.overallRating,
            comment: f.comments || "",
          };
        });

        setFeedbackData(updated);
      } catch (err) {
        console.error("Error fetching existing feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchYesterdayFeedback();
  }, []);

  const handleRating = (mealKey, rating) => {
    if (existingFeedbacks.some((f) => f.mealType === mealKey)) return;
    setFeedbackData({
      ...feedbackData,
      [mealKey]: { ...feedbackData[mealKey], rating },
    });
  };

  const handleComment = (mealKey, comment) => {
    if (existingFeedbacks.some((f) => f.mealType === mealKey)) return;
    setFeedbackData({
      ...feedbackData,
      [mealKey]: { ...feedbackData[mealKey], comment },
    });
  };

  const buildCategoryRatings = (rating) => ({
    foodQuality: rating,
    taste: rating,
    quantity: rating,
    hygiene: rating,
    service: rating,
  });

  const handleSubmit = async () => {
    const entries = Object.entries(feedbackData).filter(
      ([mealKey, v]) =>
        Number(v.rating) > 0 &&
        !existingFeedbacks.some((f) => f.mealType === mealKey)
    );

    if (entries.length === 0) {
      alert("⚠️ You’ve already submitted feedback for yesterday or no rating given.");
      return;
    }

    // ✅ Use yesterday’s date for submission
    const dateStr = getYesterdayDateString();
    const dateOnly = new Date(dateStr);

    try {
      setSubmitting(true);

      for (const [mealKey, val] of entries) {
        const payload = {
          date: dateOnly.toISOString(),
          mealType: mealKey,
          overallRating: Number(val.rating),
          categoryRatings: buildCategoryRatings(Number(val.rating)),
          comments: val.comment || "",
          suggestions: "",
          menuItems: [],
          images: [],
          isAnonymous: false,
          tags: [],
        };
        await submitFeedback(payload);
      }

      alert("✅ Thank you! Your feedback for yesterday has been submitted.");
      window.location.reload(); // Refresh to lock the cards
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit feedback: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Give Feedback</h1>
          <p className="text-neutral-600 mt-1">
            Rate and share your experience for each meal (yesterday).
          </p>
        </header>

        {loading ? (
          <p className="text-center text-neutral-500">Loading yesterday’s feedback...</p>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {meals.map((meal) => {
              const existing = existingFeedbacks.find((f) => f.mealType === meal.key);
              const isSubmitted = !!existing;

              return (
                <div
                  key={meal.key}
                  className={`bg-white rounded-xl shadow-sm border border-neutral-200 p-5 ${
                    isSubmitted ? "opacity-80" : ""
                  }`}
                >
                  <h2 className="text-xl font-semibold mb-3">
                    {meal.label}
                    {isSubmitted && (
                      <span className="ml-2 text-green-600 text-sm">(Submitted)</span>
                    )}
                  </h2>

                  {/* Rating stars */}
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer transition ${
                          feedbackData[meal.key]?.rating >= star
                            ? "text-blue-600 fill-blue-600"
                            : "text-neutral-400"
                        }`}
                        onClick={() => handleRating(meal.key, star)}
                      />
                    ))}
                  </div>

                  {/* Comment Box */}
                  <textarea
                    className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder={`Any comments for ${meal.label}?`}
                    value={feedbackData[meal.key]?.comment || ""}
                    onChange={(e) => handleComment(meal.key, e.target.value)}
                    disabled={isSubmitted}
                  />
                </div>
              );
            })}
          </section>
        )}

        <div className="mt-8 flex justify-end">
          <PrimaryButton
            onClick={handleSubmit}
            disabled={
              submitting ||
              existingFeedbacks.length >= meals.length
            }
          >
            {submitting
              ? "Submitting..."
              : existingFeedbacks.length >= meals.length
              ? "Already Submitted"
              : "Submit Feedback"}
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
