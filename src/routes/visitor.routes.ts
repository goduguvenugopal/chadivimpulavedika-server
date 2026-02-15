import express from "express";
import {
  addVisitor,
  getVisitors,
  deleteVisitor,
  getDashboardStats,
  getAllVisitorsForExport,
} from "../controllers/visitor.controller";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, addVisitor);
router.get("/dashboard", protect, getDashboardStats);
router.get("/", protect, getVisitors);
router.get("/export", protect, getAllVisitorsForExport);
router.delete("/:id", protect, deleteVisitor);

export default router;
