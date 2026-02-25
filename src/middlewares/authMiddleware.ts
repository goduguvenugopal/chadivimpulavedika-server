import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/express";

interface JwtPayload {
  id: string;
  role: "admin" | "user" | "superadmin";
  permissions: "approved" | "rejected" | "pending";
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.mg_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    req.marriageId = decoded.id;
    req.role = decoded.role;
    req.permissions = decoded.permissions;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
