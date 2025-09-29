"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../models/Ticket"));
const PaymentLog_1 = __importDefault(require("../models/PaymentLog"));
const payment_service_1 = __importDefault(require("../services/payment.service"));
const auth_1 = require("../middleware/auth");
const warp_1 = __importDefault(require("../utils/warp"));
class PaymentController {
    constructor() {
        // Check
        this.charge = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["user"]),
            (0, warp_1.default)(async (req, res) => {
                const { order_id, gross_amount, customer_details, item_details } = req.body;
                const charge = await payment_service_1.default.chargeVA({
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
        this.webhookMidtrans = [
            (0, warp_1.default)(async (req, res) => {
                const payload = req.body;
                const orderId = payload?.order_id;
                const transactionStatus = payload?.transaction_status;
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
                const ticket = await Ticket_1.default.findOne({ midtransOrderId: orderId });
                if (ticket) {
                    let newStatus = ticket.paymentStatus;
                    if (transactionStatus === "capture" ||
                        transactionStatus === "settlement") {
                        newStatus = "paid";
                    }
                    else if (transactionStatus === "expire") {
                        newStatus = "expired";
                    }
                    else if (transactionStatus === "cancel" ||
                        transactionStatus === "deny") {
                        newStatus = "cancelled";
                    }
                    ticket.paymentStatus = newStatus;
                    await ticket.save();
                }
                await PaymentLog_1.default.findOneAndUpdate({ orderId }, { $set: { midtransStatus: transactionStatus, rawPayload: payload } }, { upsert: true, new: true });
                res.json({
                    data: { orderId, transactionStatus },
                    message: "Webhook processed successfully",
                    code: 200,
                    status: "success",
                    errors: null,
                });
            }),
        ];
        this.getPaymentStatus = [
            auth_1.verifyToken,
            (0, warp_1.default)(async (req, res) => {
                const { orderId } = req.params;
                const log = await PaymentLog_1.default.findOne({ orderId });
                const ticket = await Ticket_1.default.findOne({ midtransOrderId: orderId });
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
}
exports.default = new PaymentController();
