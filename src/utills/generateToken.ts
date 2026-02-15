import * as jwt from "jsonwebtoken";

export const generateToken = (
  id: string,
  role: "admin" | "user" | "superadmin",
  permissions: "approved" | "rejected" | "pending",
) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    { id, role, permissions }, // ✅ now role exists
    secret,
    {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    },
  );
};
