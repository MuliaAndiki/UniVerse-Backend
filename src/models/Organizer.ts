import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganizerProfile {
  bio?: string;
}

export interface IOrganizer extends Document {
  userRef: mongoose.Types.ObjectId;
  campusRef: mongoose.Types.ObjectId;
  profile?: IOrganizerProfile;
  approvedByCampus: boolean;
  status: "pending" | "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const organizerSchema = new Schema<IOrganizer>(
  {
    userRef: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    campusRef: { type: Schema.Types.ObjectId, ref: "Campus", required: true },
    profile: { bio: { type: String } },
    approvedByCampus: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
  },
  { timestamps: true }
);

export const Organizer: Model<IOrganizer> =
  mongoose.models.Organizer || mongoose.model<IOrganizer>("Organizer", organizerSchema);

export default Organizer;
