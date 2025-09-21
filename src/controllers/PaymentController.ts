import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import PaymentLog from "../models/PaymentLog";
import PaymentService from "../services/payment.service";

class PaymentController {
  public charge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { order_id, gross_amount, customer_details, item_details } = req.body;
      const charge = await PaymentService.chargeVA({ order_id, gross_amount, customer_details, item_details });
      res.status(201).json(charge);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public webhookMidtrans = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const orderId = payload?.order_id as string;
      const transactionStatus = payload?.transaction_status as string;

      if (!orderId) { res.status(400).json({ message: "Invalid webhook payload" }); return; }

      // Update Ticket status
      const ticket = await Ticket.findOne({ midtransOrderId: orderId });
      if (ticket) {
        let newStatus = ticket.paymentStatus;
        if (transactionStatus === "capture" || transactionStatus === "settlement") newStatus = "paid";
        else if (transactionStatus === "expire") newStatus = "expired";
        else if (transactionStatus === "cancel" || transactionStatus === "deny") newStatus = "cancelled";
        ticket.paymentStatus = newStatus;
        await ticket.save();
      }

      await PaymentLog.findOneAndUpdate(
        { orderId },
        { $set: { midtransStatus: transactionStatus, rawPayload: payload } },
        { upsert: true, new: true }
      );

      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const log = await PaymentLog.findOne({ orderId });
      const ticket = await Ticket.findOne({ midtransOrderId: orderId });
      res.json({ orderId, midtransStatus: log?.midtransStatus, ticketId: ticket?.ticketId });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default new PaymentController();

