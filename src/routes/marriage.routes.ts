import express from "express";
import {
  createMarriage,
  loginMarriage,
  getMyMarriage,
  updateMyMarriage,
  deleteMyMarriage,
} from "../controllers/marriage.controller";

import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", createMarriage);
router.post("/login", loginMarriage);

router.get("/me", protect, getMyMarriage);
router.put("/me", protect, updateMyMarriage);
router.delete("/me", protect, deleteMyMarriage);

export default router;
