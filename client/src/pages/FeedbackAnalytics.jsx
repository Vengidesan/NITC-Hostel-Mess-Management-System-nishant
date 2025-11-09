import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import StatBadge from "../components/StatBadge.jsx";
import { Star, TrendingUp, Users } from "lucide-react";
import {
  getFeedbackStatistics,
  getConsolidatedFeedback,
} from "../api/feedbackAPI.js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export default function FeedbackAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.messId) {
          alert("No mess ID found for user.");
          return;
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // ✅ Fetch summary stats
        const statsRes = await getFeedbackStatistics({
          messId: user.messId,
          month,
          year,
        });

        // ✅ Fetch consolidated report for charts
        const consolidatedRes = await getConsolidatedFeedback({
          messId: user.messId,
          month,
          year,
        });

        const stats = statsRes?.data?.data || {};
        const report = consolidatedRes?.data?.data || {};

        // 📈 Prepare top stats
        const avg =
          stats.averageRatings?.avgOverallRating?.toFixed(1) ||
          report.averageRatings?.avgOverallRating?.toFixed(1) ||
          0;
        const total =
          stats.averageRatings?.totalFeedbacks ||
          report.averageRatings?.totalFeedbacks ||
          0;

        const mealWise =
          stats.mealWiseRatings?.reduce((acc, m) => {
            acc[
              m._id.charAt(0).toUpperCase() + m._id.slice(1)
            ] = m.avgRating.toFixed(1);
            return acc;
          }, {}) ||
          report.mealWiseRatings?.reduce((acc, m) => {
            acc[
              m._id.charAt(0).toUpperCase() + m._id.slice(1)
            ] = m.avgRating.toFixed(1);
            return acc;
          }, {}) ||
          {};

        const highestMeal =
          Object.keys(mealWise).length > 0
            ? Object.entries(mealWise).reduce((a, b) =>
                a[1] > b[1] ? a : b
              )[0]
            : "N/A";

        // 📊 Prepare rating distribution
        const distribution =
          report.ratingDistribution?.map((r) => ({
            rating: `${r._id}⭐`,
            count: r.count,
          })) || [];

        // 🧮 Chart placeholder (fake daily trend using random data)
        const trendData = Array.from({ length: 7 }, (_, i) => ({
          day: `Day ${i + 1}`,
          avgRating:
            3.5 + Math.random() * 1.5, // simulate rating fluctuation
        }));

        setAnalytics({
          avgRating: avg,
          totalFeedback: total,
          highestRatedMeal: highestMeal,
          mealRatings: mealWise,
        });
        setDistributionData(distribution);
        setChartData(trendData);
      } catch (err) {
        console.error(err);
        alert("❌ Failed to load feedback analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Feedback Analytics
          </h1>
          <p className="text-neutral-600 mt-1">
            View consolidated feedback trends and meal-wise ratings.
          </p>
        </header>

        {loading ? (
          <div className="text-center text-neutral-500 mt-20">
            Loading feedback analytics...
          </div>
        ) : analytics ? (
          <>
            {/* Top Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <StatBadge
                label="Avg Rating"
                value={analytics.avgRating}
                icon={<Star className="h-5 w-5" />}
              />
              <StatBadge
                label="Total Feedback"
                value={analytics.totalFeedback}
                icon={<Users className="h-5 w-5" />}
              />
              <StatBadge
                label="Top Rated Meal"
                value={analytics.highestRatedMeal}
                icon={<TrendingUp className="h-5 w-5" />}
              />
            </section>

            {/* Meal Wise Ratings */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Meal-wise Ratings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {Object.entries(analytics.mealRatings).map(
                  ([meal, rating]) => (
                    <div
                      key={meal}
                      className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5"
                    >
                      <h3 className="text-lg font-medium text-blue-700">
                        {meal}
                      </h3>
                      <p className="mt-2 text-neutral-700 flex items-center gap-2 text-lg">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        {rating} / 5
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Charts Section */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-3">Rating Trends</h2>
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgRating"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Average Rating"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-3">Rating Distribution</h2>
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#facc15" name="Feedback Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        ) : (
          <div className="text-center text-neutral-500 mt-20">
            No feedback analytics available for this month.
          </div>
        )}
      </main>
    </div>
  );
}
