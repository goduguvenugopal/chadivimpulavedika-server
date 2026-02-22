import { Request, Response } from "express";
import Marriage from "../models/marriage.model";
import { asyncHandler } from "../utills/asyncHandler";
import { generateToken } from "../utills/generateToken";
import { AuthRequest } from "../types/express";
import { requireRole } from "../utills/roleCheck";
import { CustomError } from "../types/CustomError";
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
      !upiPayeeName
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

    const marriage = await Marriage.create({
      marriageName,
      marriageDate,
      location,
      adminMobileNumber,
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
    const { adminMobileNumber } = req.body;

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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: marriage._id,
        marriageName: marriage.marriageName,
        role: marriage.role,
        permissions: marriage.permissions,
      },
    });
  },
);

// logout marriage
export const logoutMarriage = (req: AuthRequest, res: Response) => {
  res.cookie("mg_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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

    const marriage = await Marriage.findById(req.marriageId).select("-_id");

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
      data: marriage,
    });
  },
);

// marriage pemission update
export const updateMarriageAccess = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Only platform super admin can update access control
    requireRole(req, "admin");

    const { marriageId } = req.params;

    if (!marriageId) {
      const error = new Error("Marriage ID is required") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    // ✅ Only allow role and permissions updates
    const allowedFields = ["permissions"];

    const updateData: Record<string, any> = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      const error = new Error("No valid fields provided") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const marriage = await Marriage.findByIdAndUpdate(marriageId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!marriage) {
      const error = new Error("Marriage not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Marriage details updated successfully",
      data: marriage,
    });
  },
);

/**
 * @desc Delete Marriage
 */ export const deleteMyMarriage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

    requireRole(req, "admin");

    const marriage = await Marriage.findByIdAndDelete(req.marriageId);

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
