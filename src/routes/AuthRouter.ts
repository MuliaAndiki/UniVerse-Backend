import express from "express";
import AuthController from "../controllers/AuthController";

class AuthRouter {
  public authRouter;
  constructor() {
    this.authRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.authRouter.post("/", AuthController.register);
    this.authRouter.post("/login", AuthController.login);
    this.authRouter.post("/logout", AuthController.logout);
    this.authRouter.get("/profile", AuthController.getProfileByUser);
    this.authRouter.put("/profile", AuthController.editProfile);
    this.authRouter.post("/verify-otp", AuthController.verifyOtp);
    this.authRouter.post("/forgot-email", AuthController.forgotPasswordByEmail);
    this.authRouter.post("/send-otp-register", AuthController.sendOtpRegister);
    this.authRouter.put("/reset-password", AuthController.ResetPassword);
    this.authRouter.post(
      "/forgot-phoneNumber",
      AuthController.PickForgotPasswordByPhoneNumber
    );
  }
}

export default new AuthRouter().authRouter;
