import { Request, Response } from "express";
import Marriage from "../models/Marriage";
import { asyncHandler } from "../utills/asyncHandler";
import { generateToken } from "../utills/generateToken";
import { AuthRequest } from "../types/express";

interface CustomError extends Error {
  statusCode?: number;
}

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

    const token = generateToken(marriage._id.toString());

    res.status(200).json({
      success: true,
      token,
      data: marriage,
    });
  },
);

/**
 * @desc Get All Marriages
 */
export const getAllMarriages = asyncHandler(
  async (req: Request, res: Response) => {
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

    const marriage = await Marriage.findById(req.marriageId);

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

    const marriage = await Marriage.findByIdAndUpdate(
      req.marriageId,
      req.body,
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

/**
 * @desc Delete Marriage
 */ export const deleteMyMarriage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

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
