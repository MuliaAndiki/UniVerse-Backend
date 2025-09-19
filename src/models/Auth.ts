import mongoose from "mongoose";
import { RoleConstanst } from "../constants/role";
import { PaymentMethod } from "../constants/bank";
import { PROVINCES } from "../constants/prov";

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
    fullname: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: RoleConstanst,
      default: "user",
      required: true,
    },
    fotoProfile: {
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
    provinsi: {
      type: String,
      default: null,
      enum: PROVINCES,
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
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Auth", AuthSchema);
