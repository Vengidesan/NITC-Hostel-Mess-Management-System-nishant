// src/pages/Feedback.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { Star } from "lucide-react";
import { submitFeedback } from "../api/feedbackApi.js";

export default function Feedback() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meals = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "dinner", label: "Dinner" },
  ];

  // Keep same shape but keys match backend mealType enum
  const initial = meals.reduce((acc, m) => {
    acc[m.key] = { rating: 0, comment: "" };
    return acc;
  }, {});

  const [feedbackData, setFeedbackData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleRating = (mealKey, rating) => {
    setFeedbackData({
      ...feedbackData,
      [mealKey]: { ...feedbackData[mealKey], rating },
    });
  };

  const handleComment = (mealKey, comment) => {
    setFeedbackData({
      ...feedbackData,
      [mealKey]: { ...feedbackData[mealKey], comment },
    });
  };

  const buildCategoryRatings = (rating) => {
    // Simple mapping: use overall rating for all categories if user didn't give category wise input
    // The backend requires categoryRatings object, so we populate with same overall rating
    return {
      foodQuality: rating,
      taste: rating,
      quantity: rating,
      hygiene: rating,
      service: rating,
    };
  };

  const handleSubmit = async () => {
    // Submit each meal which has rating > 0
    const entries = Object.entries(feedbackData).filter(
      ([, v]) => Number(v.rating) > 0
    );

    if (entries.length === 0) {
      alert("⚠️ Please rate at least one meal before submitting.");
      return;
    }

    // Use selected date or today. Here: today (date-only)
    const d = new Date();
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

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

        // Await to preserve ordering & surface errors early
        await submitFeedback(payload);
      }

      alert("✅ Thank you! Your feedback has been submitted.");
      // reset ratings
      setFeedbackData(initial);
    } catch (err) {
      console.error(err);
      alert(
        "❌ Failed to submit feedback. " +
          (err.response?.data?.message || err.message)
      );
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
            Rate and share your experience for each meal today.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div
              key={meal.key}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5"
            >
              <h2 className="text-xl font-semibold mb-3">{meal.label}</h2>

              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition ${
                      feedbackData[meal.key].rating >= star
                        ? "text-blue-600 fill-blue-600"
                        : "text-neutral-400"
                    }`}
                    onClick={() => handleRating(meal.key, star)}
                  />
                ))}
              </div>

              <textarea
                className="w-full rounded-lg border border-neutral-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder={`Any comments for ${meal.label}?`}
                value={feedbackData[meal.key].comment}
                onChange={(e) => handleComment(meal.key, e.target.value)}
              />
            </div>
          ))}
        </section>

        <div className="mt-8 flex justify-end">
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
