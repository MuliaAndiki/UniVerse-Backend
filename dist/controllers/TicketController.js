"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Event_1 = __importDefault(require("../models/Event"));
const ticket_service_1 = __importDefault(require("../services/ticket.service"));
const payment_service_1 = __importDefault(require("../services/payment.service"));
const auth_1 = require("../middleware/auth");
const warp_1 = __importDefault(require("../utils/warp"));
class TicketController {
    constructor() {
        this.purchase = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["user"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params; // event id
                const userId = req.user?._id.toString();
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const event = await Event_1.default.findById(id);
                if (!event) {
                    res.status(404).json({ message: "Event not found" });
                    return;
                }
                if (event.status !== "published") {
                    res.status(400).json({ message: "Event not open for sale" });
                    return;
                }
                const ticket = await ticket_service_1.default.createPendingTicket(id, userId);
                const charge = await payment_service_1.default.chargeVA({
                    order_id: ticket.midtransOrderId,
                    gross_amount: ticket.pricePaid,
                    customer_details: {
                        email: req.user?.email,
                        first_name: req.user?.fullName,
                    },
                });
                res.status(201).json({
                    ticketId: ticket.ticketId,
                    midtransOrderId: ticket.midtransOrderId,
                    payment: charge,
                });
            }),
        ];
        this.detail = [
            auth_1.verifyToken,
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params; // ticket id
                const ticket = await Ticket_1.default.findById(id).populate({ path: "eventRef" });
                if (!ticket) {
                    res.status(404).json({ message: "Ticket not found" });
                    return;
                }
                res.json(ticket);
            }),
        ];
        this.listByUser = [
            auth_1.verifyToken,
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params; // user id
                const docs = await Ticket_1.default.find({ buyerRef: id }).populate("eventRef");
                res.json({ data: docs, total: docs.length });
            }),
        ];
        this.verify = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params; // ticket id
                const ticket = await Ticket_1.default.findById(id).populate({ path: "eventRef" });
                if (!ticket) {
                    res.status(404).json({ message: "Ticket not found" });
                    return;
                }
                if (ticket.paymentStatus !== "paid") {
                    res.status(400).json({ message: "Ticket unpaid" });
                    return;
                }
                if (ticket.used) {
                    res.status(400).json({ message: "Ticket already used" });
                    return;
                }
                const event = ticket.eventRef;
                const now = new Date();
                if (now < new Date(event.startAt) || now > new Date(event.endAt)) {
                    res.status(400).json({ message: "Ticket not valid at this time" });
                    return;
                }
                ticket.used = true;
                ticket.usedAt = new Date();
                await ticket.save();
                res.json({ valid: true, ticket });
            }),
        ];
        this.cancel = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["user"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params; // ticket id
                const ticket = await Ticket_1.default.findById(id).populate({ path: "eventRef" });
                if (!ticket) {
                    res.status(404).json({ message: "Ticket not found" });
                    return;
                }
                if (ticket.paymentStatus !== "pending") {
                    res.status(400).json({ message: "Cannot cancel" });
                    return;
                }
                const event = ticket.eventRef;
                if (new Date(event.startAt) <= new Date()) {
                    res.status(400).json({ message: "Event already started" });
                    return;
                }
                ticket.paymentStatus = "cancelled";
                await ticket.save();
                res.json({ cancelled: true });
            }),
        ];
    }
}
exports.default = new TicketController();
