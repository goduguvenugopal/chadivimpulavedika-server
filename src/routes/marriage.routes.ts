import express from "express";
import {
  createMarriage,
  loginMarriage,
  getMyMarriage,
  updateMyMarriage,
  deleteMarriage,
  getAllMarriages,
  updateMarriageAccess,
  logoutMarriage,
} from "../controllers/marriage.controller";

import { protect } from "../middlewares/authMiddleware";
import { checkSubscription } from "../middlewares/checkSubscription";

const router = express.Router();

router.post("/register", createMarriage);
router.post("/login", loginMarriage);
router.post("/logout", logoutMarriage);

router.get("/me", protect, getMyMarriage);
router.get("/", protect, getAllMarriages);

router.put("/me/update", protect, checkSubscription, updateMyMarriage);
router.put(
  "/:marriageId/access",
  protect,
  checkSubscription,
  updateMarriageAccess,
);

router.delete(
  "/delete/:marriageId",
  protect,
  checkSubscription,
  deleteMarriage,
);

export default router;
