import mongoose from "mongoose";
import { RoleConstanst } from "../constants/role";
import { PaymentMethod } from "../constants/bank";

const AuthSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
    },
    role: {
      type: String,
      enum: RoleConstanst,
      default: "user",
    },
    fotoProfile: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    methotPayment: {
      type: String,
      enum: PaymentMethod,
      default: "-",
      required: true,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    gender: {
      type: Boolean,
      default: null,
    },
    otp: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Auth", AuthSchema);
