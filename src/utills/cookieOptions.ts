import { CookieOptions } from "express";

const isProd = process.env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/", // Always define explicitly
};

export const authCookieWithExpiry: CookieOptions = {
  ...authCookieOptions,
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};