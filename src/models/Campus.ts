import mongoose, { Schema, Document, Model } from "mongoose";
import { ICampus } from "../types/campus.types";

const campusSchema = new Schema<ICampus>(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    contact: {
      email: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

export const Campus: Model<ICampus> =
  mongoose.models.Campus || mongoose.model<ICampus>("Campus", campusSchema);

export default Campus;
