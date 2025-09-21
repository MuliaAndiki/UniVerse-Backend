import { Document } from "mongoose";
export interface IPaymentLog extends Document {
  orderId: string;
  midtransStatus?: string;
  rawPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}
