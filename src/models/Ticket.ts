import mongoose, { Schema, Model } from "mongoose";
import { ITicket } from "../types/ticket.types";

const ticketSchema = new Schema<ITicket>(
  {
    eventRef: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    buyerRef: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pricePaid: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "expired", "cancelled"],
      default: "pending",
    },
    midtransOrderId: { type: String, required: true, unique: true },
    qrUrl: { type: String },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
