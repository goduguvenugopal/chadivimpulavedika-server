import * as jwt from "jsonwebtoken";

export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    { id },
    secret,
    {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    }
  );
};
