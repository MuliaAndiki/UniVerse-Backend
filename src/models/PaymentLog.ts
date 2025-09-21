import mongoose, { Schema, Model } from "mongoose";
import { IPaymentLog } from "../types/payment.types";

const paymentLogSchema = new Schema<IPaymentLog>(
  {
    orderId: { type: String, required: true, unique: true },
    midtransStatus: { type: String },
    rawPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const PaymentLog: Model<IPaymentLog> =
  mongoose.models.PaymentLog ||
  mongoose.model<IPaymentLog>("PaymentLog", paymentLogSchema);

export default PaymentLog;
