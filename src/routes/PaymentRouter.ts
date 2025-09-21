import express from "express";
import PaymentController from "../controllers/PaymentController";
import { verifyToken, requireRole } from "../middleware/auth";

class PaymentRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/payments/charge", verifyToken, requireRole(["user"]), PaymentController.charge);
    this.router.post("/webhooks/midtrans", PaymentController.webhookMidtrans);
    this.router.get("/payments/:orderId", verifyToken, PaymentController.getPaymentStatus);
  }
}

export default new PaymentRouter().router;
