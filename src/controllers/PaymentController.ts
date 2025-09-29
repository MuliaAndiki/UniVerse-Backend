import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import PaymentLog from "../models/PaymentLog";
import PaymentService from "../services/payment.service";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class PaymentController {
  // Check
  public charge = [
    verifyToken,
    requireRole(["user"]),
    warp(async (req: Request, res: Response): Promise<void> => {
      const { order_id, gross_amount, customer_details, item_details } =
        req.body;
      const charge = await PaymentService.chargeVA({
        order_id,
        gross_amount,
        customer_details,
        item_details,
      });

      res.status(201).json({
        data: charge,
        message: "Charge created successfully",
        code: 201,
        status: "success",
        errors: null,
      });
    }),
  ];

  public webhookMidtrans = [
    warp(async (req: Request, res: Response): Promise<void> => {
      const payload = req.body;
      const orderId = payload?.order_id as string;
      const transactionStatus = payload?.transaction_status as string;

      if (!orderId) {
        res.status(400).json({
          data: null,
          message: "Invalid webhook payload",
          code: 400,
          status: "error",
          errors: [
            { field: "order_id", message: "Missing order_id in payload" },
          ],
        });
        return;
      }

      // Update Ticket status
      const ticket = await Ticket.findOne({ midtransOrderId: orderId });
      if (ticket) {
        let newStatus = ticket.paymentStatus;
        if (
          transactionStatus === "capture" ||
          transactionStatus === "settlement"
        ) {
          newStatus = "paid";
        } else if (transactionStatus === "expire") {
          newStatus = "expired";
        } else if (
          transactionStatus === "cancel" ||
          transactionStatus === "deny"
        ) {
          newStatus = "cancelled";
        }
        ticket.paymentStatus = newStatus;
        await ticket.save();
      }

      await PaymentLog.findOneAndUpdate(
        { orderId },
        { $set: { midtransStatus: transactionStatus, rawPayload: payload } },
        { upsert: true, new: true }
      );

      res.json({
        data: { orderId, transactionStatus },
        message: "Webhook processed successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }),
  ];

  public getPaymentStatus = [
    verifyToken,
    warp(async (req: Request, res: Response): Promise<void> => {
      const { orderId } = req.params;
      const log = await PaymentLog.findOne({ orderId });
      const ticket = await Ticket.findOne({ midtransOrderId: orderId });

      res.json({
        data: {
          orderId,
          midtransStatus: log?.midtransStatus || null,
          ticketId: ticket?.ticketId || null,
        },
        message: "Payment status retrieved successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }),
  ];
}

export default new PaymentController();
