import mongoose, { Document } from "mongoose";
import { EventCategory, EventStatus } from "../constants/events";
export interface IEvent extends Document {
  title: string;
  description: string;
  category: EventCategory;
  organizerRef: mongoose.Types.ObjectId;
  campusRef: mongoose.Types.ObjectId;
  location: string;
  startAt: Date;
  endAt: Date;
  capacity: number;
  price: number;
  images: string[];
  googleCalendarId?: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}
