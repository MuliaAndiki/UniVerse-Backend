import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/user.types";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "organizer", "campus", "super-admin"],
      default: "user",
    },
    campusRef: { type: Schema.Types.ObjectId, ref: "Campus", default: null },
    profile: {
      fullName: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
