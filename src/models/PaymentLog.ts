import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentLog extends Document {
  orderId: string;
  midtransStatus?: string;
  rawPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentLogSchema = new Schema<IPaymentLog>(
  {
    orderId: { type: String, required: true, unique: true },
    midtransStatus: { type: String },
    rawPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const PaymentLog: Model<IPaymentLog> =
  mongoose.models.PaymentLog || mongoose.model<IPaymentLog>("PaymentLog", paymentLogSchema);

export default PaymentLog;
