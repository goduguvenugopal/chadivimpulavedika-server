// middleware/checkSubscription.ts

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/express";
import Marriage from "../models/marriage.model";
import { authCookieOptions } from "../utills/cookieOptions";

export const checkSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.marriageId) return next();

  const marriage = await Marriage.findById(req.marriageId).select(
    "subscriptionExpiresAt status permissions",
  );

  if (!marriage) {
    return res.status(401).json({
      success: false,
      message: "Invalid user",
    });
  }

  // 🚨 FIRST: Check status
  if (marriage.status !== "active") {
    res.clearCookie("mg_token", authCookieOptions);

    return res.status(403).json({
      success: false,
      message: "Subscription inactive",
    });
  }

  // 🚨 SECOND: Check expiry
  if (
    marriage.subscriptionExpiresAt &&
    new Date() > marriage.subscriptionExpiresAt
  ) {
    await Marriage.findByIdAndUpdate(req.marriageId, {
      status: "inactive",
      permissions: "expired",
    });

    res.clearCookie("mg_token", authCookieOptions);

    return res.status(401).json({
      success: false,
      message: "Subscription expired",
    });
  }

  next();
};
