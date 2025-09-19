"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("../models/Auth"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const env_config_1 = require("../utils/env.config");
const generateOtp_1 = require("../utils/generateOtp");
const mailer_1 = require("../utils/mailer");
const uploadClodinary_1 = require("../utils/uploadClodinary");
const multer_1 = require("../middleware/multer");
const google_auth_library_1 = require("google-auth-library");
const CLIENT_ID = env_config_1.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = env_config_1.env.JWT_SECRET;
const CLIENT = new google_auth_library_1.OAuth2Client(CLIENT_ID);
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.fullname || !auth.password) {
                    res.status(400).json({
                        status: 400,
                        message: "Mohon Isi Semua Kolum",
                    });
                    return;
                }
                const isEmailAlready = await Auth_1.default.findOne({
                    email: auth.email,
                });
                if (isEmailAlready) {
                    res.status(400).json({
                        status: 400,
                        message: "Email Sudah Ada",
                    });
                    return;
                }
                const otp = (0, generateOtp_1.generateOtp)(6);
                const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
                bcryptjs_1.default.hash(auth.password, 10, async (err, hash) => {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: "Password Anda",
                        });
                        return;
                    }
                    const newAuth = new Auth_1.default({
                        email: auth.email,
                        password: hash,
                        fullname: auth.fullname,
                        role: auth.role,
                        otp: otp,
                        isVerified: false,
                    });
                    newAuth.otpExpires = otpExpires;
                    await newAuth.save();
                    await (0, mailer_1.sendOTPEmail)(auth.email, otp);
                    res.status(201).json({
                        status: 200,
                        message: "Berhasil Melakukan Register",
                        data: newAuth,
                    });
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Servel Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.login = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email || !auth.password) {
                    res.status(400).json({
                        status: 400,
                        message: "Mohon Isi Semua Kolum",
                    });
                }
                const isAuthExist = await Auth_1.default.findOne({
                    email: auth.email,
                });
                if (!isAuthExist) {
                    res.status(404).json({
                        status: 404,
                        message: "Account not found",
                    });
                    return;
                }
                const isMatch = await bcryptjs_1.default.compare(auth.password, isAuthExist.password);
                if (!isMatch) {
                    res.status(401).json({
                        status: 401,
                        message: "Invalid credentials",
                    });
                    return;
                }
                const payload = {
                    _id: isAuthExist._id,
                    email: isAuthExist.email,
                    fullname: isAuthExist.fullname,
                    role: isAuthExist.role,
                };
                if (!env_config_1.env.JWT_SECRET) {
                    console.error("JWT_SECRET is not defined in environment variables");
                    res.status(500).json({
                        status: 500,
                        message: "Server configuration error.",
                    });
                    return;
                }
                jsonwebtoken_1.default.sign(payload, env_config_1.env.JWT_SECRET, { expiresIn: "1d" }, async (err, token) => {
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
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
                return;
            }
        };
        this.logout = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const { _id } = req.user;
                    const auth = await Auth_1.default.findById(_id);
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
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                    return;
                }
            },
        ];
        this.getProfileByUser = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const { _id } = req.user;
                    const auth = await Auth_1.default.findById(_id);
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
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                    return;
                }
            },
        ];
        this.editProfile = [
            auth_1.verifyToken,
            multer_1.uploadImages,
            async (req, res) => {
                try {
                    const auth = req.body;
                    const user = req.user._id;
                    if (!auth) {
                        res.status(400).json({
                            status: 400,
                            message: "Account Not Found",
                        });
                        return;
                    }
                    const files = req.files;
                    const foto = files.fotoProfile?.[0];
                    let fotoUrl;
                    if (foto) {
                        const result = await (0, uploadClodinary_1.uploadCloudinary)(foto.buffer, "fotoProfile", foto.originalname);
                        fotoUrl = result.secure_url;
                    }
                    const updateData = {
                        ...auth,
                        ...(fotoUrl && { fotoProfile: fotoUrl }),
                    };
                    await Auth_1.default.findByIdAndUpdate(user, {
                        $set: updateData,
                    });
                    res.status(200).json({
                        status: 200,
                        message: "Profile  Update Successfully",
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                    return;
                }
            },
        ];
        this.verifyOtp = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email && !auth.phoneNumber) {
                    res.status(400).json({
                        status: 400,
                        message: "Email of Phone Number is Required",
                    });
                    return;
                }
                const user = await Auth_1.default.findOne(auth.email ? { email: auth.email } : { phoneNumber: auth.phoneNumber });
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
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
                return;
            }
        };
        this.forgotPasswordByEmail = async (req, res) => {
            try {
                const auth = req.body;
                const user = await Auth_1.default.findOne({ email: auth.email });
                if (!user) {
                    res.status(400).json({
                        status: 400,
                        message: "Account Not Found",
                        data: null,
                    });
                    return;
                }
                const otp = (0, generateOtp_1.generateOtp)(6);
                const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();
                await (0, mailer_1.sendOTPEmail)(auth.email, otp);
                res.status(200).json({
                    status: 200,
                    message: "Successfully Send Otp ForPassword",
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
                return;
            }
        };
        this.PickForgotPasswordByPhoneNumber = async (req, res) => {
            try {
                const auth = req.body;
                const user = await Auth_1.default.findOne({ phoneNumber: auth.phoneNumber });
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
                const otp = (0, generateOtp_1.generateOtp)(6);
                const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();
                await (0, mailer_1.sendOTPEmail)(user.email, otp);
                res.status(200).json({
                    status: 200,
                    message: "Successfully Send Otp ForPassword",
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.ResetPassword = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth.email && !auth.phoneNumber) {
                    res.status(400).json({
                        status: 400,
                        message: "Email of Phone Number is Required",
                    });
                    return;
                }
                const user = await Auth_1.default.findOne(auth.email ? { email: auth.email } : { phoneNumber: auth.phoneNumber });
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
                const hashPassowrd = await bcryptjs_1.default.hash(auth.password, 10);
                user.password = hashPassowrd;
                (user.otp = undefined), (user.otpExpires = undefined);
                await user.save();
                res.status(200).json({
                    status: 200,
                    message: "Successfully Reset Your Passowrd",
                    data: user,
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
                return;
            }
        };
        this.sendOtpRegister = async (req, res) => {
            try {
                const auth = req.body;
                if (!auth || !auth.email) {
                    res.status(400).json({
                        status: 400,
                        message: "Email Requared",
                    });
                    return;
                }
                const user = await Auth_1.default.findOne({ email: auth.email });
                if (!user) {
                    res.status(400).json({
                        status: 400,
                        messange: "Email Not Found",
                    });
                    return;
                }
                const otp = (0, generateOtp_1.generateOtp)(6);
                const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
                user.otp = otp;
                user.otpExpires = otpExpires;
                await user.save();
                await (0, mailer_1.sendOTPEmail)(auth.email, otp);
                res.status(200).json({
                    status: 200,
                    message: "Otp Send Successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 500,
                    message: "Server Internal Error",
                    error: error instanceof Error ? error.message : error,
                });
            }
        };
        this.deleteAkun = async () => {
            try {
                const thresholdDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                const result = await Auth_1.default.deleteMany({
                    isVerified: false,
                    createdAt: { $lt: thresholdDate },
                });
                console.log(`[CRON] ${result.deletedCount} akun tidak verifikasi dihapus`);
            }
            catch (error) {
                console.error("[CRON] Gagal hapus akun:", error);
            }
        };
        this.loginGoogle = [
            auth_1.verifyToken,
            async (req, res) => {
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
                    let user = await Auth_1.default.findOne({
                        email: payload.email,
                    });
                    if (!user) {
                        user = (await Auth_1.default.create({
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
                        }));
                    }
                    const JwtPayload = {
                        email: user?.email || "",
                        fullname: user?.fullname || "",
                        fotoProfile: user?.fotoProfile || "",
                        role: user?.role || "",
                    };
                    const token = jsonwebtoken_1.default.sign(JwtPayload, JWT_SECRET, { expiresIn: "7d" });
                    res.status(200).json({
                        status: 200,
                        message: "Login berhasil",
                        token,
                        user: JwtPayload,
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                }
            },
        ];
    }
}
exports.default = new AuthController();
