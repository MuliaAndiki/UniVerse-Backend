import express from "express";
import PaymentController from "../controllers/PaymentController";

class PaymentRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/payments/charge", PaymentController.charge);
    this.router.post("/webhooks/midtrans", PaymentController.webhookMidtrans);
    this.router.get("/payments/:orderId", PaymentController.getPaymentStatus);
  }
}

export default new PaymentRouter().router;
