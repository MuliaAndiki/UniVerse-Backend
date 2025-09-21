import mongoose, { Document, Types } from "mongoose";
import { IOrganizerProfile } from "../partial";

export interface IOrganizer extends Document {
  userRef: mongoose.Types.ObjectId;
  campusRef: mongoose.Types.ObjectId;
  profile?: IOrganizerProfile;
  approvedByCampus: boolean;
  status: "pending" | "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}
