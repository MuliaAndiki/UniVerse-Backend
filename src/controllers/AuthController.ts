import Auth from "../models/Auth";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  IAuth,
  PickRegister,
  PickLogin,
  JwtPayload,
  PickLogout,
  PickGetProfile,
  PickEditProfile,
  PickVerifyOtp,
  PickForgotPasswordByEmail,
  PickResetPassword,
  PickSendOtpRegister,
  PickForgotPasswordByNomorHp,
  PickLoginGoogle,
} from "../types/auth.types";
import { verifyToken } from "../middleware/auth";
import { env } from "../utils/env.config";
import { generateOtp } from "../utils/generateOtp";
import { sendOTPEmail } from "../utils/mailer";
import { uploadCloudinary } from "../utils/uploadClodinary";
import { uploadImages } from "../middleware/multer";
import { OAuth2Client } from "google-auth-library";
import { Document } from "mongoose";

const CLIENT_ID = env.GOOGLE_CLIENT_ID!;
const JWT_SECRET = env.JWT_SECRET!;

const CLIENT = new OAuth2Client(CLIENT_ID);

class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickRegister = req.body;

      if (!auth.email || !auth.fullname || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "Mohon Isi Semua Kolum",
        });
        return;
      }

      const isEmailAlready: IAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (isEmailAlready) {
        res.status(400).json({
          status: 400,
          message: "Email Sudah Ada",
        });
        return;
      }

      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      bcrypt.hash(auth.password, 10, async (err, hash): Promise<void> => {
        if (err) {
          res.status(500).json({
            status: 500,
            message: "Password Anda",
          });
          return;
        }
        const newAuth = new Auth({
          email: auth.email,
          password: hash,
          fullname: auth.fullname,
          role: auth.role,
          otp: otp,
          isVerified: false,
        });
        newAuth.otpExpires = otpExpires;
        await newAuth.save();

        await sendOTPEmail(auth.email, otp);

        res.status(201).json({
          status: 200,
          message: "Berhasil Melakukan Register",
          data: newAuth,
        });
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Servel Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickLogin = req.body;
      if (!auth.email || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "Mohon Isi Semua Kolum",
        });
      }

      const isAuthExist: IAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (!isAuthExist) {
        res.status(404).json({
          status: 404,
          message: "Account not found",
        });
        return;
      }

      const isMatch = await bcrypt.compare(auth.password, isAuthExist.password);
      if (!isMatch) {
        res.status(401).json({
          status: 401,
          message: "Invalid credentials",
        });
        return;
      }

      const payload: JwtPayload = {
        _id: isAuthExist._id,
        email: isAuthExist.email,
        fullname: isAuthExist.fullname,
        role: isAuthExist.role,
      };

      if (!env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        res.status(500).json({
          status: 500,
          message: "Server configuration error.",
        });
        return;
      }

      jwt.sign(
        payload,
        env.JWT_SECRET,
        { expiresIn: "1d" },
        async (err, token): Promise<void> => {
          if (err) {
            res.status(500).json(err);
            return;
          }

          isAuthExist.set("token", token);
          await isAuthExist.save();
          res.status(200).json({
            status: 200,
            data: {
              isAuthExist,
              token,
            },
            message: "Login successfully",
          });
          return;
        }
      );
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
      return;
    }
  };
  public logout = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickLogout = req.user as JwtPayload;

        const auth: IAuth | null = await Auth.findById(_id);
        if (!auth) {
          res.status(400).json({
            status: 400,
            message: "Account not found",
          });
          return;
        }

        auth.set("token", null);
        await auth.save();
        res.status(200).json({
          status: 200,
          message: "Account logout successfully",
        });

        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
        return;
      }
    },
  ];
  public getProfileByUser = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickGetProfile = req.user as JwtPayload;

        const auth: IAuth | null = await Auth.findById(_id);

        if (!auth) {
          res.status(400).json({
            status: 400,
            message: "Account not found",
          });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "User Profile Found",
          data: auth,
        });
        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
        return;
      }
    },
  ];
  public editProfile = [
    verifyToken,
    uploadImages,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const auth: PickEditProfile = req.body;
        const user = (req as any).user._id;

        if (!auth) {
          res.status(400).json({
            status: 400,
            message: "Account Not Found",
          });
          return;
        }

        const files = req.files as Record<string, Express.Multer.File[]>;
        const foto = files.fotoProfile?.[0];
        let fotoUrl: String | undefined;

        if (foto) {
          const result = await uploadCloudinary(
            foto.buffer,
            "fotoProfile",
            foto.originalname
          );
          fotoUrl = result.secure_url;
        }

        const updateData = {
          ...auth,
          ...(fotoUrl && { fotoProfile: fotoUrl }),
        };
        await Auth.findByIdAndUpdate(user, {
          $set: updateData,
        });

        res.status(200).json({
          status: 200,
          message: "Profile  Update Successfully",
        });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
        return;
      }
    },
  ];

  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickVerifyOtp = req.body;

      if (!auth.email && !auth.phoneNumber) {
        res.status(400).json({
          status: 400,
          message: "Email of Phone Number is Required",
        });
        return;
      }

      const user = await Auth.findOne(
        auth.email ? { email: auth.email } : { phoneNumber: auth.phoneNumber }
      );

      if (!user) {
        res.status(400).json({
          status: 400,
          message: "Email Tidak Ditemukan",
        });
        return;
      }

      if (user.otp !== auth.otp) {
        res.status(400).json({
          status: 400,
          message: "OTP Failed",
        });
        return;
      }

      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      res.status(200).json({
        status: 200,
        message: "OTP Successfully IsVerif",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
      return;
    }
  };
  public forgotPasswordByEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const auth: PickForgotPasswordByEmail = req.body;

      const user = await Auth.findOne({ email: auth.email });
      if (!user) {
        res.status(400).json({
          status: 400,
          message: "Account Not Found",
          data: null,
        });
        return;
      }

      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;

      await user.save();
      await sendOTPEmail(auth.email, otp);
      res.status(200).json({
        status: 200,
        message: "Successfully Send Otp ForPassword",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
      return;
    }
  };

  public PickForgotPasswordByPhoneNumber = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const auth: PickForgotPasswordByNomorHp = req.body;

      const user = await Auth.findOne({ phoneNumber: auth.phoneNumber });
      if (!user) {
        res.status(400).json({
          status: 400,
          message: "Number Phone Not Found",
        });
        return;
      }

      if (!user.email) {
        res.status(400).json({
          statu: 400,
          message: "No email linked with this phone number",
        });
        return;
      }
      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;

      await user.save();
      await sendOTPEmail(user.email, otp);

      res.status(200).json({
        status: 200,
        message: "Successfully Send Otp ForPassword",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
  public ResetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickResetPassword = req.body;

      if (!auth.email && !auth.phoneNumber) {
        res.status(400).json({
          status: 400,
          message: "Email of Phone Number is Required",
        });
        return;
      }

      const user = await Auth.findOne(
        auth.email ? { email: auth.email } : { phoneNumber: auth.phoneNumber }
      );

      if (!user) {
        res.status(400).json({
          status: 400,
          message: "Account Not Found",
        });
        return;
      }

      if (!user.isVerified) {
        res.status(403).json({
          status: 403,
          message: "Email Not Yet Verified",
        });
        return;
      }

      const hashPassowrd = await bcrypt.hash(auth.password, 10);
      user.password = hashPassowrd;
      (user.otp = undefined), (user.otpExpires = undefined);

      await user.save();

      res.status(200).json({
        status: 200,
        message: "Successfully Reset Your Passowrd",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
      return;
    }
  };
  public sendOtpRegister = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const auth: PickSendOtpRegister = req.body;

      if (!auth || !auth.email) {
        res.status(400).json({
          status: 400,
          message: "Email Requared",
        });
        return;
      }

      const user = await Auth.findOne({ email: auth.email });
      if (!user) {
        res.status(400).json({
          status: 400,
          messange: "Email Not Found",
        });
        return;
      }

      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;

      await user.save();
      await sendOTPEmail(auth.email, otp);

      res.status(200).json({
        status: 200,
        message: "Otp Send Successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
  public deleteAkun = async (): Promise<void> => {
    try {
      const thresholdDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const result = await Auth.deleteMany({
        isVerified: false,
        createdAt: { $lt: thresholdDate },
      });

      console.log(
        `[CRON] ${result.deletedCount} akun tidak verifikasi dihapus`
      );
    } catch (error) {
      console.error("[CRON] Gagal hapus akun:", error);
    }
  };
  public loginGoogle = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { tokenId } = req.body;
        if (!tokenId) {
          res.status(404).json({
            status: 404,
            message: "Token Id Invalid",
          });
          return;
        }
        const ticket = await CLIENT.verifyIdToken({
          idToken: tokenId,
          audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload?.email || !payload) {
          res.status(400).json({
            status: 400,
            message: "tokenId isRequored",
          });
          return;
        }
        let user: (IAuth & Document) | null = await Auth.findOne({
          email: payload.email,
        });
        if (!user) {
          user = (await Auth.create({
            email: payload.email,
            fullname: payload.name,
            fotoProfile: payload.picture,
            role: "user",
            password: "-",
            gender: true,
            methotPayment: "-",
            phoneNumber: "-",
            otp: "-",
            isVerified: true,
          })) as IAuth;
        }
        const JwtPayload: PickLoginGoogle = {
          email: user?.email || "",
          fullname: user?.fullname || "",
          fotoProfile: user?.fotoProfile || "",
          role: user?.role || "",
        };
        const token = jwt.sign(JwtPayload, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
          status: 200,
          message: "Login berhasil",
          token,
          user: JwtPayload,
        });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
      }
    },
  ];
}

export default new AuthController();
