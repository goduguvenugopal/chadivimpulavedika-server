import express from "express";
import {
  createMarriage,
  loginMarriage,
  getMyMarriage,
  updateMyMarriage,
  deleteMyMarriage,
  getAllMarriages,
  updateMarriageAccess,
  logoutMarriage,
} from "../controllers/marriage.controller";

import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", createMarriage);
router.post("/login", loginMarriage);
router.post("/logout", logoutMarriage);

router.get("/me", protect, getMyMarriage);
router.get("/", protect, getAllMarriages);

router.put("/me", protect, updateMyMarriage);
router.put("/:marriageId/access", protect, updateMarriageAccess);

router.delete("/me", protect, deleteMyMarriage);

export default router;
