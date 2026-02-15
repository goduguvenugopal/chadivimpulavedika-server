import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
  marriageId: mongoose.Types.ObjectId;
  visitorName: string;
  amount: number;
  paymentMode: "CASH" | "UPI";
  address: string;
  notes?: string;
  giftGiven?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const visitorSchema = new Schema<IVisitor>(
  {
    marriageId: {
      type: Schema.Types.ObjectId,
      ref: "Marriage",
      required: true,
    },

    visitorName: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMode: {
      type: String,
      enum: ["CASH", "UPI"],
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    giftGiven: {
      type: Boolean,
      default: false, // If not provided
    },
    notes: {
      type: String,
      trim: true,
      default : "best wishes"
    },
  },
  {
    timestamps: true, // Auto Date & Time
  },
);

export default mongoose.model<IVisitor>("Visitor", visitorSchema);
