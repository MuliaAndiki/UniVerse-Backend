"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const role_1 = require("../constants/role");
const bank_1 = require("../constants/bank");
const prov_1 = require("../constants/prov");
const AuthSchema = new mongoose_1.default.Schema({
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
        enum: role_1.RoleConstanst,
        default: "user",
        required: true,
    },
    fotoProfile: {
        type: String,
        default: null,
    },
    methotPayment: {
        type: String,
        enum: bank_1.PaymentMethod,
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
        enum: prov_1.PROVINCES,
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("Auth", AuthSchema);
