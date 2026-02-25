import express from "express";
import {
  addVisitor,
  getVisitors,
  deleteVisitor,
  getDashboardStats,
  getAllVisitorsForExport,
  updateVisitor,
} from "../controllers/visitor.controller";
import { protect } from "../middlewares/authMiddleware";
import { checkSubscription } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/", protect, checkSubscription, addVisitor);
router.get("/dashboard", protect, checkSubscription, getDashboardStats);
router.get("/", protect, checkSubscription, getVisitors);
router.get("/export", protect, checkSubscription, getAllVisitorsForExport);
router.delete("/:id", protect, checkSubscription, deleteVisitor);
router.put("/update/:id", protect, checkSubscription, updateVisitor);

export default router;
