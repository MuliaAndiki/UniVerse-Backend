import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import TicketService from "../services/ticket.service";
import PaymentService from "../services/payment.service";

class TicketController {
  public purchase = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // event id
      const userId = req.user?._id.toString();
      if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

      const event = await Event.findById(id);
      if (!event) { res.status(404).json({ message: "Event not found" }); return; }
      if (event.status !== "published") { res.status(400).json({ message: "Event not open for sale" }); return; }

      const ticket = await TicketService.createPendingTicket(id, userId);

      // create Midtrans charge (example: VA)
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
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public detail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // ticket id
      const ticket = await Ticket.findById(id).populate({ path: "eventRef" });
      if (!ticket) { res.status(404).json({ message: "Ticket not found" }); return; }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public listByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // user id
      const docs = await Ticket.find({ buyerRef: id }).populate("eventRef");
      res.json({ data: docs, total: docs.length });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // ticket id
      const ticket = await Ticket.findById(id).populate({ path: "eventRef" });
      if (!ticket) { res.status(404).json({ message: "Ticket not found" }); return; }
      if (ticket.paymentStatus !== "paid") { res.status(400).json({ message: "Ticket unpaid" }); return; }
      if (ticket.used) { res.status(400).json({ message: "Ticket already used" }); return; }

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
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // ticket id
      const ticket = await Ticket.findById(id).populate({ path: "eventRef" });
      if (!ticket) { res.status(404).json({ message: "Ticket not found" }); return; }
      if (ticket.paymentStatus !== "pending") { res.status(400).json({ message: "Cannot cancel" }); return; }
      const event = ticket.eventRef as any;
      if (new Date(event.startAt) <= new Date()) { res.status(400).json({ message: "Event already started" }); return; }

      ticket.paymentStatus = "cancelled";
      await ticket.save();
      res.json({ cancelled: true });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default new TicketController();
