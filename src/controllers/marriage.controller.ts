import { Request, Response } from "express";
import Marriage, { IMarriage, marriageSchema } from "../models/marriage.model";
import { asyncHandler } from "../utills/asyncHandler";
import { generateToken } from "../utills/generateToken";
import { AuthRequest } from "../types/express";
import { requireRole } from "../utills/roleCheck";
import { CustomError } from "../types/CustomError";
import bcrypt from "bcrypt";
/**
 * @desc Create Marriage
 */
export const createMarriage = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      marriageName,
      marriageDate,
      location,
      adminMobileNumber,
      password,
      upiId,
      upiPayeeName,
      role,
    } = req.body;

    if (
      !marriageName ||
      !marriageDate ||
      !location ||
      !adminMobileNumber ||
      !upiId ||
      !upiPayeeName ||
      !password
    ) {
      const error = new Error("All fields are required") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    // 🔥 CHECK IF ADMIN MOBILE ALREADY EXISTS
    const existingMarriage = await Marriage.findOne({
      adminMobileNumber,
    });

    if (existingMarriage) {
      const error = new Error(
        "Marriage already registered with this mobile number",
      ) as CustomError;
      error.statusCode = 409; // Conflict
      throw error;
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const marriage = await Marriage.create({
      marriageName,
      marriageDate,
      location,
      adminMobileNumber,
      password: hashedPassword,
      upiId,
      upiPayeeName,
      role,
    });

    res.status(201).json({
      success: true,
      data: marriage,
    });
  },
);

// login Marriage
export const loginMarriage = asyncHandler(
  async (req: Request, res: Response) => {
    const { adminMobileNumber, password } = req.body;

    if (!adminMobileNumber) {
      const error: any = new Error("Mobile number is required");
      error.statusCode = 400;
      throw error;
    }

    const marriage = await Marriage.findOne({ adminMobileNumber });
    if (!marriage) {
      const error: any = new Error("Marriage not found");
      error.statusCode = 404;
      throw error;
    }

    // comparing hash password
    const isMatch = await bcrypt.compare(password, marriage.password);

    if (!isMatch) {
      const error: any = new Error("Invalid Password");
      error.statusCode = 400;
      throw error;
    }

    // 🔐 Generate JWT
    const token = generateToken(
      marriage._id.toString(),
      marriage.role,
      marriage.permissions,
    );

    res.cookie("mg_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: marriage,
    });
  },
);

// logout marriage
export const logoutMarriage = (req: AuthRequest, res: Response) => {
  res.cookie("mg_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * @desc Get All Marriages
 */
export const getAllMarriages = asyncHandler(
  async (req: Request, res: Response) => {
    requireRole(req, "admin");

    const marriages = await Marriage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: marriages.length,
      data: marriages,
    });
  },
);

/**
 * @desc Get Single Marriage
 */
export const getMyMarriage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

    const marriage = await Marriage.findById(req.marriageId).select(
      "-_id -password",
    );

    if (!marriage) {
      const error = new Error("Marriage not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: marriage,
    });
  },
);

/**
 * @desc Update Marriage
 */
export const updateMyMarriage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

    requireRole(req, "user");

    // ✅ Only allow these fields
    const allowedFields = [
      "marriageName",
      "marriageDate",
      "location",
      "adminMobileNumber",
      "upiId",
      "upiPayeeName",
    ];

    const updateData: Record<string, any> = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const marriage = await Marriage.findByIdAndUpdate(
      req.marriageId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!marriage) {
      const error = new Error("Marriage not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Marriage updated successfully",
    });
  },
);

// marriage update
export const updateMarriageAccess = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 🔐 Only platform admin
    requireRole(req, "admin");

    const { marriageId } = req.params;

    if (!marriageId) {
      const error = new Error("Marriage ID is required") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    // 🔎 Find marriage first
    const marriage = await Marriage.findById(marriageId);

    if (!marriage) {
      const error = new Error("Marriage not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    // ✅ Allowed fields
    const allowedFields = [
      "permissions",
      "password",
      "status",
      "subscriptionExpiresAt",
    ];

    const updateData: Record<string, any> = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // 🔐 If password updating → hash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // 📅 Expiry Logic
    if (!updateData.subscriptionExpiresAt) {
      // If admin didn't provide expiry → default 3 days
      updateData.subscriptionExpiresAt = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      );
    }

    // 🚀 Auto activate if currently inactive
    if (marriage.status === "inactive") {
      updateData.status = "active";
    }

    const updatedMarriage = await Marriage.findByIdAndUpdate(
      marriageId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Marriage details updated successfully",
      data: updatedMarriage,
    });
  },
);

/**
 *
 * @desc Delete Marriage (Admin Only)
 */
export const deleteMarriage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 🔐 Only platform admin
    requireRole(req, "admin");

    const { marriageId } = req.params;

    if (!marriageId) {
      const error = new Error("Marriage ID is required") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const marriage = await Marriage.findByIdAndDelete(marriageId);

    if (!marriage) {
      const error = new Error("Marriage not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Marriage deleted successfully",
    });
  },
);
