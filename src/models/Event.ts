import mongoose, { Schema, Model } from "mongoose";
import { IEvent } from "../types/events.types";

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["webinar", "festival", "perlombaan"],
      required: true,
    },
    organizerRef: {
      type: Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    campusRef: { type: Schema.Types.ObjectId, ref: "Campus", required: true },
    location: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    googleCalendarId: { type: String },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
