import { Document } from "mongoose";
import mongoose from "mongoose";
import { IUserProfile } from "../partial";
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: "user" | "organizer" | "campus" | "super-admin";
  campusRef?: mongoose.Types.ObjectId | null;
  profile?: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
}
