import mongoose, { Schema, Document } from "mongoose";

export interface IMarriage extends Document {
  marriageName: string;
  marriageDate: string;
  location: string;
  adminMobileNumber: string;
  upiId: string;
  upiPayeeName: string;
  role: "user" | "admin";
  permissions: "approved" | "rejected" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const marriageSchema = new Schema<IMarriage>(
  {
    marriageName: {
      type: String,
      required: true,
      trim: true,
    },

    marriageDate: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    adminMobileNumber: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/, // Indian mobile validation
    },

    upiId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    upiPayeeName: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "user", "superadmin"],
      default: "user",
    },
    permissions: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IMarriage>("Marriage", marriageSchema);
