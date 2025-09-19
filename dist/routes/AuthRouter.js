"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
class AuthRouter {
    constructor() {
        this.authRouter = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.authRouter.post("/", AuthController_1.default.register);
        this.authRouter.post("/login", AuthController_1.default.login);
        this.authRouter.post("/logout", AuthController_1.default.logout);
        this.authRouter.get("/profile", AuthController_1.default.getProfileByUser);
        this.authRouter.put("/profile", AuthController_1.default.editProfile);
        this.authRouter.post("/verify-otp", AuthController_1.default.verifyOtp);
        this.authRouter.post("/forgot-email", AuthController_1.default.forgotPasswordByEmail);
        this.authRouter.post("/send-otp-register", AuthController_1.default.sendOtpRegister);
        this.authRouter.put("/reset-password", AuthController_1.default.ResetPassword);
        this.authRouter.post("/forgot-phoneNumber", AuthController_1.default.PickForgotPasswordByPhoneNumber);
        this.authRouter.post("/google", AuthController_1.default.loginGoogle);
    }
}
exports.default = new AuthRouter().authRouter;
