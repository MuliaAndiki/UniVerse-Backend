import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampusContact {
  email?: string;
  phone?: string;
}

export interface ICampus extends Document {
  name: string;
  address?: string;
  admins: mongoose.Types.ObjectId[];
  contact?: ICampusContact;
  createdAt: Date;
  updatedAt: Date;
}

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

export const Campus: Model<ICampus> = mongoose.models.Campus || mongoose.model<ICampus>("Campus", campusSchema);

export default Campus;
