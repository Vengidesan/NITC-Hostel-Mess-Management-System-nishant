import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import axios from "axios";

export default function ManageMenus() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [menus, setMenus] = useState([]);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [nextWeekMenu, setNextWeekMenu] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const messId = storedUser?.messId;

  const api = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  // 🧩 Format backend menu into editable form
  const formatMenu = (menuData) => {
    const formatted = {};
    menuData.dailyMenus.forEach((dayMenu) => {
      formatted[dayMenu.day] = {
        breakfast: dayMenu.meals.breakfast?.items[0]?.name || "",
        lunch: dayMenu.meals.lunch?.items[0]?.name || "",
        dinner: dayMenu.meals.dinner?.items[0]?.name || "",
      };
    });
    return formatted;
  };

  // 🟢 Fetch all menus and detect current + next week
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${api}/api/menu/mess/${messId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.data || [];
        setMenus(data);

        const today = new Date();

        // ✅ Detect current week correctly (till Sunday 23:59)
        const current = data.find((m) => {
          const start = new Date(m.weekStartDate);
          const end = new Date(m.weekEndDate);
          end.setHours(23, 59, 59, 999);
          return start <= today && today <= end;
        });

        // ✅ Detect next week's menu if exists
        const next = data.find((m) => {
          const start = new Date(m.weekStartDate);
          return start > today;
        });

        setNextWeekMenu(next || null);

        if (current) {
          setCurrentMenu(current);
          setIsPublished(current.status === "published");
          setWeeklyMenu(formatMenu(current));
        } else {
          await fetchPreviousMenu();
        }
      } catch (error) {
        console.error("Error fetching menus:", error.message);
        await fetchPreviousMenu();
      } finally {
        setLoading(false);
      }
    };

    const fetchPreviousMenu = async () => {
      try {
        const response = await axios.get(`${api}/api/menu/previous/${messId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.data) {
          setWeeklyMenu(formatMenu(response.data.data));
        } else throw new Error("No previous menu found");
      } catch {
        console.warn("⚠️ No previous menu found, creating blank menu.");
        setWeeklyMenu({
          Monday: { breakfast: "", lunch: "", dinner: "" },
          Tuesday: { breakfast: "", lunch: "", dinner: "" },
          Wednesday: { breakfast: "", lunch: "", dinner: "" },
          Thursday: { breakfast: "", lunch: "", dinner: "" },
          Friday: { breakfast: "", lunch: "", dinner: "" },
          Saturday: { breakfast: "", lunch: "", dinner: "" },
          Sunday: { breakfast: "", lunch: "", dinner: "" },
        });
      }
    };

    if (messId) fetchMenus();
  }, [messId, refresh]);

  // 🧾 Update form fields
  const handleChange = (day, meal, value) => {
    setWeeklyMenu({
      ...weeklyMenu,
      [day]: { ...weeklyMenu[day], [meal]: value },
    });
  };

  // 🧩 Save or update weekly menu
  const handleSave = async () => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun,1=Mon,...
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() + 1); // Monday
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      // 🚫 Prevent creating next week before Monday
      // ✅ Allow creation if no menus exist at all (first-time setup)
const isFirstMenu = menus.length === 0;

// 🚫 Prevent creating next week before Monday (except first menu)
if (!isFirstMenu && !currentMenu && dayOfWeek !== 1) {
  alert("⚠️ You can only create a new week's menu starting Monday.");
  return;
}


      setLoading(true);
      const weekNumber = Math.ceil(
        ((today - new Date(today.getFullYear(), 0, 1)) / 86400000 +
          new Date(today.getFullYear(), 0, 1).getDay() +
          1) / 7
      );

      const dailyMenus = Object.entries(weeklyMenu).map(([day, meals], i) => ({
        day,
        date: new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
        meals: {
          breakfast: { items: [{ name: meals.breakfast || "N/A" }] },
          lunch: { items: [{ name: meals.lunch || "N/A" }] },
          dinner: { items: [{ name: meals.dinner || "N/A" }] },
          eveningSnacks: { items: [] },
        },
      }));

      const payload = {
        messId,
        weekStartDate: start,
        weekEndDate: end,
        weekNumber,
        year: today.getFullYear(),
        dailyMenus,
        announcement: "Weekly menu updated by manager",
      };

      if (currentMenu && currentMenu.status === "draft") {
        await axios.put(`${api}/api/menu/${currentMenu._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ Draft menu updated!");
      } else if (!currentMenu) {
        await axios.post(`${api}/api/menu`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("✅ New weekly menu created!");
      } else if (currentMenu.status === "published") {
        alert("⚠️ This week's menu is already published and cannot be edited.");
        return;
      }

      setRefresh(!refresh);
    } catch (error) {
      console.error(error);
      alert(
        `❌ Failed to save menu: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Publish menu
  const handlePublish = async (menuId) => {
    try {
      await axios.put(`${api}/api/menu/${menuId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Menu published successfully!");
      setRefresh(!refresh);
    } catch (error) {
      alert(`❌ Publish failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // 🕒 Sunday Preview Section
  const dayOfWeek = new Date().getDay();
  const isSunday = dayOfWeek === 0;

  if (loading && Object.keys(weeklyMenu).length === 0)
    return (
      <div className="h-screen flex items-center justify-center text-xl font-medium">
        Loading menus...
      </div>
    );

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Weekly Menu Management
          </h1>
          {isPublished && (
            <p className="text-green-600 mt-2 font-medium">
              ✅ This week's menu is published and locked.
            </p>
          )}
          {!isPublished && currentMenu?.status === "draft" && (
            <p className="text-yellow-600 mt-2 font-medium">
              ✏️ Editing draft menu — changes are not yet published.
            </p>
          )}
        </header>

        {/* 🧾 Menu Form */}
        <section className="space-y-6">
          {Object.entries(weeklyMenu).map(([day, meals]) => (
            <div
              key={day}
              className="bg-white border border-neutral-200 shadow-sm rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold mb-4 text-blue-700">{day}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["breakfast", "lunch", "dinner"].map((mealType) => (
                  <div key={mealType}>
                    <label className="text-sm text-neutral-600 capitalize">
                      {mealType}
                    </label>
                    <input
                      type="text"
                      className="w-full border border-neutral-300 rounded-lg p-2 mt-1 text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${mealType}`}
                      value={meals[mealType]}
                      onChange={(e) =>
                        handleChange(day, mealType, e.target.value)
                      }
                      disabled={isPublished}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="mt-8 flex justify-end">
          <PrimaryButton onClick={handleSave} disabled={loading || isPublished}>
            {isPublished
              ? "Published (Locked)"
              : loading
              ? "Saving..."
              : currentMenu?.status === "draft"
              ? "Save Draft"
              : "Create Menu"}
          </PrimaryButton>
        </div>

        {/* 🕒 Next Week Preview (Visible on Sunday) */}
        {isSunday && nextWeekMenu && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-3 text-blue-700">
              👀 Next Week Preview (Read-only)
            </h2>
            <p className="text-neutral-600 mb-4">
              You can review next week's planned menu. Editing will open Monday morning.
            </p>
            {nextWeekMenu.dailyMenus.map((day) => (
              <div
                key={day.day}
                className="bg-gray-50 border border-neutral-200 rounded-lg p-4 mb-3"
              >
                <h3 className="font-semibold text-blue-600">{day.day}</h3>
                <p className="text-sm text-neutral-700">
                  🍳 Breakfast: {day.meals.breakfast?.items[0]?.name || "N/A"}<br />
                  🍛 Lunch: {day.meals.lunch?.items[0]?.name || "N/A"}<br />
                  🍽 Dinner: {day.meals.dinner?.items[0]?.name || "N/A"}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* 🧩 All Menus List */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">All Menus</h2>
          {menus.length === 0 ? (
            <p className="text-neutral-500">No menus found yet.</p>
          ) : (
            <div className="space-y-4">
              {menus.map((menu) => {
                const options = { day: "2-digit", month: "short", year: "numeric" };
                const start = new Date(menu.weekStartDate).toLocaleDateString("en-GB", options);
                const end = new Date(menu.weekEndDate).toLocaleDateString("en-GB", options);
                const now = new Date();
                const weekStart = new Date(menu.weekStartDate);
                const weekEnd = new Date(menu.weekEndDate);
                weekEnd.setHours(23, 59, 59, 999);
                const isCurrent = weekStart <= now && now <= weekEnd;

                return (
                  <div
                    key={menu._id}
                    className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">
                        Week {menu.weekNumber} ({start} → {end})
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            menu.status === "published"
                              ? "text-green-600"
                              : menu.status === "draft"
                              ? "text-yellow-600"
                              : "text-gray-500"
                          }`}
                        >
                          {menu.status}
                        </span>
                      </p>
                    </div>

                    {menu.status === "draft" && isCurrent ? (
                      <button
                        onClick={() => handlePublish(menu._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm cursor-not-allowed"
                      >
                        {menu.status === "published" ? "Published" : "Old Menu"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
