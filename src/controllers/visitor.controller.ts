import { Request, Response } from "express";
import { asyncHandler } from "../utills/asyncHandler";
import { AuthRequest } from "../types/express";
import { CustomError } from "../types/CustomError";
import Visitor from "../models/visitor.model";
import mongoose from "mongoose";
import Marriage from "../models/marriage.model";

/**
 * @desc Add Visitor
 * @route POST /api/visitors
 * @access Private
 */
export const addVisitor = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

    // Fetch marriage
    const isMarriage = await Marriage.findById(req.marriageId);

    if (!isMarriage) {
      const error = new Error("Marriage not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    // Check approval status
    if (isMarriage.permissions !== "approved") {
      const error = new Error(
        "Visitors can only be added after marriage is approved",
      ) as CustomError;
      error.statusCode = 403;
      throw error;
    }

    const { visitorName, amount, paymentMode, address, notes, giftGiven } =
      req.body;

    if (!visitorName || !amount || !paymentMode || !address) {
      const error = new Error("Please fill all required fields") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const visitor = await Visitor.create({
      marriageId: req.marriageId,
      visitorName,
      amount,
      paymentMode,
      address,
      notes,
      giftGiven,
    });

    res.status(201).json({
      success: true,
      message: "Visitor added successfully",
      data: visitor,
    });
  },
);

/**
 * @desc Get All Visitors (for logged marriage)
 * @route GET /api/visitors
 * @access Private
 */
export const getVisitors = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

    // Pagination
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Search
    const search = (req.query.search as string)?.trim();

    const filter: any = {
      marriageId: req.marriageId,
    };

    if (search) {
      filter.$or = [
        { visitorName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const totalVisitors = await Visitor.countDocuments(filter);

    const visitors = await Visitor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalVisitors / limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalVisitors,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: visitors,
    });
  },
);

/**
 * @desc Delete Visitor
 * @route DELETE /api/visitors/:id
 * @access Private
 */
export const deleteVisitor = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      const error = new Error("Visitor not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    if (visitor.marriageId.toString() !== req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 403;
      throw error;
    }

    await visitor.deleteOne();

    res.status(200).json({
      success: true,
      message: "Visitor deleted successfully",
    });
  },
);

/**
 * @desc Dashboard Stats
 * @route GET /api/visitors/dashboard
 * @access Private
 */
export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      const error = new Error("Not authorized") as CustomError;
      error.statusCode = 401;
      throw error;
    }

    const stats = await Visitor.aggregate([
      {
        $match: {
          marriageId: new mongoose.Types.ObjectId(req.marriageId),
        },
      },
      {
        $group: {
          _id: null,

          totalAmount: { $sum: "$amount" },

          totalCashAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "CASH"] }, "$amount", 0],
            },
          },

          totalUpiAmount: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "UPI"] }, "$amount", 0],
            },
          },

          totalVisitors: { $sum: 1 },

          totalGifts: {
            $sum: {
              $cond: [{ $eq: ["$giftGiven", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      totalCashAmount: 0,
      totalUpiAmount: 0,
      totalVisitors: 0,
      totalGifts: 0,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// get all visitors
export const getAllVisitorsForExport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.marriageId) {
      throw new Error("Not authorized");
    }

    const visitors = await Visitor.find({
      marriageId: req.marriageId,
    }).sort({ createdAt: -1 });

    const totalAmount = visitors.reduce((acc, item) => acc + item.amount, 0);

    res.status(200).json({
      success: true,
      totalAmount,
      totalVisitors: visitors.length,
      data: visitors,
    });
  },
);
