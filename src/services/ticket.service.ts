import { nanoid } from "nanoid";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import { QRCodeService } from "./qrcode.service";
import { uploadCloudinary } from "../utils/uploadClodinary";

export class TicketService {
  static async createPendingTicket(eventId: string, buyerId: string) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    const ticketId = `TCKT_${nanoid(10)}`;
    const midtransOrderId = `ORD_${nanoid(12)}`;

    const ticket = await Ticket.create({
      ticketId,
      eventRef: event._id,
      buyerRef: buyerId,
      pricePaid: event.price,
      paymentStatus: "pending",
      midtransOrderId,
    });

    // prepare QR (contains ticketId)
    const qrBuffer = await QRCodeService.generate(ticket.ticketId);
    const upload = await uploadCloudinary(qrBuffer, `tickets`, `${ticket.ticketId}.png`);

    ticket.qrUrl = upload.secure_url;
    await ticket.save();

    return ticket;
  }
}

export default TicketService;
