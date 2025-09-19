import { Document, Types } from "mongoose";

export interface IAuth extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  fullname: string;
  role: string;
  provinsi: string;
  gender: boolean;
  methotPayment: string;
  phoneNumber: string;
  fotoProfile: string;
  otp: string;
  isVerified: boolean;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
  __v: any;
}

export type JwtPayload = Pick<IAuth, "_id" | "email" | "fullname" | "role">;
export type PickRegister = Pick<
  IAuth,
  "email" | "fullname" | "password" | "role"
>;
export type PickLogin = Pick<IAuth, "email" | "password">;
export type PickLogout = Pick<IAuth, "_id">;
export type PickGetProfile = Pick<IAuth, "_id">;
export type PickEditProfile = Pick<
  IAuth,
  "fullname" | "email" | "phoneNumber" | "gender" | "provinsi" | "lat" | "lng"
>;
export type PickVerifyOtp = Pick<IAuth, "email" | "otp" | "phoneNumber">;
export type PickForgotPasswordByEmail = Pick<IAuth, "email">;
export type PickSendOtpRegister = Pick<IAuth, "email">;
export type PickResetPassword = Pick<
  IAuth,
  "email" | "phoneNumber" | "password"
>;
export type PickForgotPasswordByNomorHp = Pick<IAuth, "phoneNumber">;
