import { Document } from "mongoose";
import mongoose from "mongoose";
import { PaymentStatus } from "../constants/payment";
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
