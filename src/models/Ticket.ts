import mongoose, { Schema, Document, Model } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "expired" | "cancelled";

export interface ITicket extends Document {
  ticketId: string;
  eventRef: mongoose.Types.ObjectId;
  buyerRef: mongoose.Types.ObjectId;
  pricePaid: number;
  paymentStatus: PaymentStatus;
  midtransOrderId: string;
  qrUrl?: string;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    eventRef: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    buyerRef: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pricePaid: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "expired", "cancelled"], default: "pending" },
    midtransOrderId: { type: String, required: true, unique: true },
    qrUrl: { type: String },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
