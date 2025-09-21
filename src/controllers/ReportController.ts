import { Request, Response } from "express";
import Campus from "../models/Campus";
import Organizer from "../models/Organizer";
import Event from "../models/Event";
import Ticket from "../models/Ticket";

class ReportController {
  public superAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
      const [campusCount, organizers, events, tickets] = await Promise.all([
        Campus.countDocuments({}),
        Organizer.aggregate([{ $group: { _id: "$campusRef", count: { $sum: 1 } } }]),
        Event.aggregate([{ $group: { _id: "$campusRef", count: { $sum: 1 } } }]),
        Ticket.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, revenue: { $sum: "$pricePaid" }, sold: { $sum: 1 } } },
        ]),
      ]);
      const revenue = tickets[0]?.revenue || 0;
      const sold = tickets[0]?.sold || 0;
      res.json({ metrics: { campusCount, revenue, ticketsSold: sold }, organizersByCampus: organizers, eventsByCampus: events });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public campus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { campusId } = req.params;
      const [organizersCount, eventsCount, ticketsAgg] = await Promise.all([
        Organizer.countDocuments({ campusRef: campusId }),
        Event.countDocuments({ campusRef: campusId }),
        Ticket.aggregate([
          { $lookup: { from: "events", localField: "eventRef", foreignField: "_id", as: "e" } },
          { $unwind: "$e" },
          { $match: { "e.campusRef": (req.params as any).campusId, paymentStatus: "paid" } },
          { $group: { _id: null, revenue: { $sum: "$pricePaid" }, sold: { $sum: 1 } } },
        ]),
      ]);
      const revenue = ticketsAgg[0]?.revenue || 0;
      const ticketsSold = ticketsAgg[0]?.sold || 0;
      res.json({ metrics: { organizersCount, eventsCount, ticketsSold, revenue } });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public organizer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId } = req.params;
      const [eventsCount, ticketsAgg] = await Promise.all([
        Event.countDocuments({ organizerRef: orgId }),
        Ticket.aggregate([
          { $lookup: { from: "events", localField: "eventRef", foreignField: "_id", as: "e" } },
          { $unwind: "$e" },
          { $match: { "e.organizerRef": (req.params as any).orgId, paymentStatus: "paid" } },
          { $group: { _id: null, revenue: { $sum: "$pricePaid" }, sold: { $sum: 1 } } },
        ]),
      ]);
      const revenue = ticketsAgg[0]?.revenue || 0;
      const ticketsSold = ticketsAgg[0]?.sold || 0;
      res.json({ metrics: { eventsCount, ticketsSold, revenue } });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default new ReportController();
