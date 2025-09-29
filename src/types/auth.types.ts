import { Document, Types } from "mongoose";

export interface IAuth extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  fullName: string;
  role: string;
  gender: boolean;
  methotPayment: string;
  phoneNumber: string;
  fotoProfile: string;
  otp: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: any;
}

export type JwtPayload = Pick<IAuth, "_id" | "email" | "fullName" | "role">;
export type PickRegister = Pick<
  IAuth,
  "email" | "fullName" | "password" | "role" | "phoneNumber"
>;
export type PickLogin = Pick<IAuth, "email" | "password">;
export type PickLogout = Pick<IAuth, "_id">;
export type PickGetProfile = Pick<IAuth, "_id">;
export type PickEditProfile = Pick<
  IAuth,
  "fullName" | "email" | "phoneNumber" | "gender" | "otp"
>;
export type PickVerifyOtp = Pick<IAuth, "email" | "otp" | "phoneNumber">;
export type PickForgotPasswordByEmail = Pick<IAuth, "email">;
export type PickSendOtpRegister = Pick<IAuth, "email">;
export type PickResetPassword = Pick<
  IAuth,
  "email" | "phoneNumber" | "password"
>;
export type PickForgotPasswordByNomorHp = Pick<IAuth, "phoneNumber">;

export type PickLoginGoogle = Pick<
  IAuth,
  "email" | "fotoProfile" | "role" | "fullName"
>;

export type PickDeleteAuth = Pick<IAuth, "_id">;
