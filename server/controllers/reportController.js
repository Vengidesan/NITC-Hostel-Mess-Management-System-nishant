import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import Bill from "../models/Bill.js";
import Attendance from "../models/Attendance.js";
import Menu from '../models/Menu.js';

export const getSystemReports = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1️⃣ Total Students
    const totalStudents = await User.countDocuments({ role: "student" });

    // 2️⃣ Average Meal Rating
    const feedbacks = await Feedback.find({});
    const avgMealRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
          feedbacks.length
        : 0;

    // 3️⃣ Monthly Revenue
    const currentBills = await Bill.find({
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: new Date(currentYear, currentMonth + 1, 0),
      },
      paymentStatus: "paid",
    });
    const monthlyRevenue = currentBills.reduce(
      (sum, b) => sum + (b.amountPaid || 0),
      0
    );

    // 4️⃣ Attendance Rate (only absences stored)
    const absentRecords = await Attendance.find({
      date: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: new Date(currentYear, currentMonth + 1, 0),
      },
    });

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const absentDays = absentRecords.length;
    const attendanceRate = ((daysInMonth - absentDays) / daysInMonth) * 100;

    // 🔹 Generate trend data (past 6 months)
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      return {
        label: date.toLocaleString("default", { month: "short" }),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
    }).reverse();

    // 🔸 Rating Trend
    const ratingTrend = await Promise.all(
      months.map(async ({ month, year, label }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const feedbacks = await Feedback.find({
          date: { $gte: start, $lte: end },
        });

        const avg =
          feedbacks.length > 0
            ? feedbacks.reduce((s, f) => s + (f.overallRating || 0), 0) /
              feedbacks.length
            : 0;

        return { month: label, avgRating: Number(avg.toFixed(2)) };
      })
    );

    // 🔸 Revenue Trend
    const revenueTrend = await Promise.all(
      months.map(async ({ month, year, label }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const bills = await Bill.find({
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "paid",
        });
        const revenue = bills.reduce((s, b) => s + (b.amountPaid || 0), 0);
        return { month: label, revenue };
      })
    );

    // 🔸 Attendance Trend (absence-based)
    const attendanceTrend = await Promise.all(
      months.map(async ({ month, year, label }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);

        const absentRecords = await Attendance.find({
          date: { $gte: start, $lte: end },
        });

        const daysInMonth = new Date(year, month, 0).getDate();
        const absentDays = absentRecords.length;
        const attendance = ((daysInMonth - absentDays) / daysInMonth) * 100;
        const absence = 100 - attendance;

        return {
          month: label,
          attendance: Number(attendance.toFixed(1)),
          absence: Number(absence.toFixed(1)),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        avgMealRating,
        monthlyRevenue,
        attendanceRate: attendanceRate.toFixed(1),
        ratingTrend,
        revenueTrend,
        attendanceTrend,
      },
    });
  } catch (err) {
    console.error("System Reports Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load reports",
      error: err.message,
    });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // All bills (for all months)
    const bills = await Bill.find();

    const billsGenerated = bills.length;
    const paidBills = bills.filter((b) => b.paymentStatus === "paid").length;
    const pendingBills = bills.filter((b) => b.paymentStatus === "unpaid").length;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        billsGenerated,
        paidBills,
        pendingBills,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard stats",
      error: error.message,
    });
  }
};


export const getAttendanceInsights = async (req, res) => {
  try {
    const user = req.user; // obtained from token
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 🔹 Filter students (and attendance) based on role
    const studentFilter = { role: "student" };
    const attendanceFilter = {};

    if (user.role === "manager") {
      studentFilter.messId = user.messId;
      attendanceFilter.messId = user.messId;
    }

    // Get all students in scope
    const students = await User.find(studentFilter, "_id messId");
    const studentIds = students.map((s) => s._id);
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return res.status(200).json({
        success: true,
        data: {
          avgMonthlyAttendance: 0,
          highestMonth: "N/A",
          avgAbsencesPerStudent: 0,
          peakAbsenceDay: "N/A",
          monthlyTrend: [],
          weekdayPattern: [],
          reasonBreakdown: [],
        },
      });
    }

    // 🔹 Pull attendance records for those students (last 6 months)
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
    attendanceFilter.studentId = { $in: studentIds };
    attendanceFilter.date = { $gte: sixMonthsAgo };

    const records = await Attendance.find(attendanceFilter);

    if (!records.length) {
      return res.status(200).json({
        success: true,
        data: {
          avgMonthlyAttendance: 100,
          highestMonth: "N/A",
          avgAbsencesPerStudent: 0,
          peakAbsenceDay: "N/A",
          monthlyTrend: [],
          weekdayPattern: [],
          reasonBreakdown: [],
        },
      });
    }

    // 1️⃣ Monthly Attendance Trend
    const monthlyStats = {};
    for (const rec of records) {
      const d = new Date(rec.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyStats[key]) monthlyStats[key] = { absents: 0 };
      monthlyStats[key].absents++;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const monthlyTrend = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const absents = monthlyStats[key]?.absents || 0;
      const attendance = ((daysInMonth - absents) / daysInMonth) * 100;
      monthlyTrend.push({
        month: monthNames[date.getMonth()],
        attendance: Number(attendance.toFixed(1)),
      });
    }

    // 2️⃣ Average Monthly Attendance
    const avgMonthlyAttendance =
      monthlyTrend.reduce((sum, m) => sum + m.attendance, 0) / monthlyTrend.length;

    // 3️⃣ Highest Attendance Month
    const highestMonth =
      monthlyTrend.reduce((best, m) =>
        m.attendance > best.attendance ? m : best
      ).month;

    // 4️⃣ Average Absences per Student
    const totalAbsences = records.length;
    const avgAbsencesPerStudent = totalStudents
      ? (totalAbsences / totalStudents / 6).toFixed(1)
      : 0;

    // 5️⃣ Weekday Pattern
    const weekdayCount = Array(7).fill(0);
    records.forEach((r) => weekdayCount[new Date(r.date).getDay()]++);
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayPattern = weekdayNames.map((d, i) => ({
      day: d,
      absences: weekdayCount[i],
    }));

    const peakAbsenceDay = weekdayPattern.reduce((a, b) =>
      a.absences > b.absences ? a : b
    ).day;

    // 6️⃣ Absence Reason Breakdown
    const reasonStats = {};
    records.forEach((r) => {
      const reason = r.reason || "Not Specified";
      reasonStats[reason] = (reasonStats[reason] || 0) + 1;
    });
    const reasonBreakdown = Object.entries(reasonStats).map(([reason, count]) => ({
      reason,
      count,
    }));

    // ✅ Final response
    res.status(200).json({
      success: true,
      data: {
        avgMonthlyAttendance: Number(avgMonthlyAttendance.toFixed(1)),
        highestMonth,
        avgAbsencesPerStudent,
        peakAbsenceDay,
        monthlyTrend,
        weekdayPattern,
        reasonBreakdown,
      },
    });
  } catch (err) {
    console.error("Attendance Insights Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load attendance insights",
      error: err.message,
    });
  }
};




export const getManagerDashboardStats = async (req, res) => {
  try {
    const manager = req.user;
    const messId = manager.messId;

    if (!messId) {
      return res.status(400).json({
        success: false,
        message: "Manager is not assigned to any mess",
      });
    }

    // 1️⃣ Average Meal Rating for this mess
    const feedbacks = await Feedback.find({ messId });
    const avgMealRating =
      feedbacks.length > 0
        ? (
            feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
            feedbacks.length
          ).toFixed(2)
        : 0;

    // 2️⃣ Absence Requests (current month)
    const now = new Date();
    const absenceRequests = await Attendance.countDocuments({
      messId,
      isOnLeave: true,
      date: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    });

    // 3️⃣ Weekly Menu Cycles (this year)
    const weeklyMenus = await Menu.countDocuments({
      messId,
      year: now.getFullYear(),
    });

    res.status(200).json({
      success: true,
      data: {
        avgMealRating: Number(avgMealRating),
        absenceRequests,
        weeklyMenus,
      },
    });
  } catch (err) {
    console.error("Manager Dashboard Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager dashboard data",
      error: err.message,
    });
  }
};


export const getStudentDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // 1️⃣ Calculate the period from 1st of month → today
    const monthStart = new Date(year, month, 1);
    const today = new Date(year, month, now.getDate(), 23, 59, 59);

    const attendanceRecords = await Attendance.find({
      studentId: user._id,
      date: { $gte: monthStart, $lte: today },
    });

    // Total number of days from start of month till today
    const totalDays = now.getDate(); // e.g., if today is 7th, totalDays = 7

    // Count absent days
    const absentDays = attendanceRecords.filter(
      (rec) => rec.isOnLeave || rec.totalMealsPresent === 0
    ).length;

    // Compute present days
    const mealsThisMonth = totalDays - absentDays;
    const effectiveMeals = mealsThisMonth >= 0 ? mealsThisMonth : 0;

    // 2️⃣ Average rating given
    const feedbacks = await Feedback.find({ studentId: user._id });
    const avgRating =
      feedbacks.length > 0
        ? (
            feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) /
            feedbacks.length
          ).toFixed(1)
        : 0;

    // 3️⃣ Pending bills
    const pendingBills = await Bill.find({
      studentId: user._id,
      paymentStatus: { $in: ["unpaid", "partially_paid", "overdue"] },
    });

    const pendingAmount = pendingBills.reduce(
      (sum, b) => sum + (b.amountDue || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        mealsThisMonth: effectiveMeals,
        avgRating: Number(avgRating),
        pendingAmount,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats.",
      error: error.message,
    });
  }
};



export const getAllPayments = async (req, res) => {
  try {
    const { month, year, status } = req.query;

    const query = {
      isCancelled: false,
    };

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status && status !== "all") query.paymentStatus = status;

    const payments = await Bill.find(query)
      .populate("studentId", "name registrationNumber email hostelId")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load payment records.",
      error: err.message,
    });
  }
};


