"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../models/Ticket"));
const PaymentLog_1 = __importDefault(require("../models/PaymentLog"));
const payment_service_1 = __importDefault(require("../services/payment.service"));
class PaymentController {
    constructor() {
        this.charge = async (req, res) => {
            try {
                const { order_id, gross_amount, customer_details, item_details } = req.body;
                const charge = await payment_service_1.default.chargeVA({ order_id, gross_amount, customer_details, item_details });
                res.status(201).json(charge);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.webhookMidtrans = async (req, res) => {
            try {
                const payload = req.body;
                const orderId = payload?.order_id;
                const transactionStatus = payload?.transaction_status;
                if (!orderId) {
                    res.status(400).json({ message: "Invalid webhook payload" });
                    return;
                }
                // Update Ticket status
                const ticket = await Ticket_1.default.findOne({ midtransOrderId: orderId });
                if (ticket) {
                    let newStatus = ticket.paymentStatus;
                    if (transactionStatus === "capture" || transactionStatus === "settlement")
                        newStatus = "paid";
                    else if (transactionStatus === "expire")
                        newStatus = "expired";
                    else if (transactionStatus === "cancel" || transactionStatus === "deny")
                        newStatus = "cancelled";
                    ticket.paymentStatus = newStatus;
                    await ticket.save();
                }
                await PaymentLog_1.default.findOneAndUpdate({ orderId }, { $set: { midtransStatus: transactionStatus, rawPayload: payload } }, { upsert: true, new: true });
                res.json({ received: true });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.getPaymentStatus = async (req, res) => {
            try {
                const { orderId } = req.params;
                const log = await PaymentLog_1.default.findOne({ orderId });
                const ticket = await Ticket_1.default.findOne({ midtransOrderId: orderId });
                res.json({ orderId, midtransStatus: log?.midtransStatus, ticketId: ticket?.ticketId });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
    }
}
exports.default = new PaymentController();
