"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const nanoid_1 = require("nanoid");
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Event_1 = __importDefault(require("../models/Event"));
const qrcode_service_1 = require("./qrcode.service");
const uploadClodinary_1 = require("../utils/uploadClodinary");
class TicketService {
    static async createPendingTicket(eventId, buyerId) {
        const event = await Event_1.default.findById(eventId);
        if (!event)
            throw new Error("Event not found");
        const ticketId = `TCKT_${(0, nanoid_1.nanoid)(10)}`;
        const midtransOrderId = `ORD_${(0, nanoid_1.nanoid)(12)}`;
        const ticket = await Ticket_1.default.create({
            ticketId,
            eventRef: event._id,
            buyerRef: buyerId,
            pricePaid: event.price,
            paymentStatus: "pending",
            midtransOrderId,
        });
        // prepare QR (contains ticketId)
        const qrBuffer = await qrcode_service_1.QRCodeService.generate(ticket.ticketId);
        const upload = await (0, uploadClodinary_1.uploadCloudinary)(qrBuffer, `tickets`, `${ticket.ticketId}.png`);
        ticket.qrUrl = upload.secure_url;
        await ticket.save();
        return ticket;
    }
}
exports.TicketService = TicketService;
exports.default = TicketService;
