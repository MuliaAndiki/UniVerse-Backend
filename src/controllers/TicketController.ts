import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import TicketService from "../services/ticket.service";
import PaymentService from "../services/payment.service";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class TicketController {
  public purchase = [
    verifyToken,
    requireRole(["user"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params; // event id
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const event = await Event.findById(id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      if (event.status !== "published") {
        res.status(400).json({ message: "Event not open for sale" });
        return;
      }

      const ticket = await TicketService.createPendingTicket(id, userId);

      const charge = await PaymentService.chargeVA({
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

  public detail = [
    verifyToken,
    warp(async (req: Request, res: Response) => {
      const { id } = req.params; // ticket id
      const ticket = await Ticket.findById(id).populate({ path: "eventRef" });
      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
      res.json(ticket);
    }),
  ];

  public listByUser = [
    verifyToken,
    warp(async (req: Request, res: Response) => {
      const { id } = req.params; // user id
      const docs = await Ticket.find({ buyerRef: id }).populate("eventRef");
      res.json({ data: docs, total: docs.length });
    }),
  ];

  public verify = [
    verifyToken,
    requireRole(["organizer", "campus"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params; // ticket id
      const ticket = await Ticket.findById(id).populate({ path: "eventRef" });
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

      const event = ticket.eventRef as any;
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

  public cancel = [
    verifyToken,
    requireRole(["user"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params; // ticket id
      const ticket = await Ticket.findById(id).populate({ path: "eventRef" });
      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
      if (ticket.paymentStatus !== "pending") {
        res.status(400).json({ message: "Cannot cancel" });
        return;
      }
      const event = ticket.eventRef as any;
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

export default new TicketController();
