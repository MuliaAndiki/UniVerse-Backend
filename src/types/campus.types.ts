import mongoose, { Document } from "mongoose";
import { ICampusContact } from "../partial";

export interface ICampus extends Document {
  name: string;
  address?: string;
  admins: mongoose.Types.ObjectId[];
  contact?: ICampusContact;
  createdAt: Date;
  updatedAt: Date;
}
