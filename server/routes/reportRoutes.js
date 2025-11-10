import express from "express";
import { getAdminDashboardStats, getAllPayments, getAttendanceInsights, getManagerDashboardStats, getStudentDashboardStats, getSystemReports } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🟢 Admin and Manager can access system-level reports
router.get("/system", protect, authorize("admin", "manager"), getSystemReports);
router.get("/admin-dashboard", protect, authorize("admin"), getAdminDashboardStats);
router.get("/payments", protect, authorize("admin"), getAllPayments);
router.get("/attendance-insights", protect, authorize("manager", "admin"), getAttendanceInsights);

router.get("/manager-dashboard", protect, authorize("manager"), getManagerDashboardStats);
router.get("/student-dashboard", protect, authorize("student"), getStudentDashboardStats);



export default router;
