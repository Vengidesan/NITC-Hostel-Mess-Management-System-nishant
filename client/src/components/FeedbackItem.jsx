// src/components/FeedbackItem.jsx
import React from "react";

export default function FeedbackItem({ feedback }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="text-sm text-neutral-500">
          {new Date(feedback.date).toLocaleDateString()} • {feedback.mealType}
        </div>
        <div className="text-lg font-semibold">
          Rating: {feedback.overallRating} / 5
        </div>
        {feedback.comments && (
          <p className="text-neutral-600 mt-2">{feedback.comments}</p>
        )}
        <div className="text-xs text-neutral-400 mt-2">
          {feedback.isAnonymous ? "Anonymous" : feedback.studentId?.name || "Student"}
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm">
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
            {feedback.priority}
          </span>
        </div>
        <div className="text-xs text-neutral-400 mt-2">{feedback.upvotes || 0} upvotes</div>
      </div>
    </div>
  );
}
