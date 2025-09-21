import { Request, Response } from "express";
import Campus from "../models/Campus";
import Organizer from "../models/Organizer";
import Event from "../models/Event";
import Ticket from "../models/Ticket";

class CampusController {
  public create = async (req: Request, res: Response) => {
    try {
      const campus = await Campus.create(req.body);
      res.status(201).json(campus);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public list = async (_req: Request, res: Response) => {
    try {
      const docs = await Campus.find();
      res.json({ data: docs, total: docs.length });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public detail = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await Campus.findById(id);
      if (!doc) return res.status(404).json({ message: "Campus not found" });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await Campus.findByIdAndUpdate(id, { $set: req.body }, { new: true });
      if (!doc) return res.status(404).json({ message: "Campus not found" });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const del = await Campus.findByIdAndDelete(id);
      if (!del) return res.status(404).json({ message: "Campus not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public reports = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const campus = await Campus.findById(id);
      if (!campus) return res.status(404).json({ message: "Campus not found" });

      const [eventsCount, organizersCount, ticketsAgg] = await Promise.all([
        Event.countDocuments({ campusRef: id }),
        Organizer.countDocuments({ campusRef: id }),
        Ticket.aggregate([
          { $lookup: { from: "events", localField: "eventRef", foreignField: "_id", as: "e" } },
          { $unwind: "$e" },
          { $match: { "e.campusRef": campus._id, paymentStatus: "paid" } },
          { $group: { _id: null, revenue: { $sum: "$pricePaid" }, sold: { $sum: 1 } } },
        ]),
      ]);

      const revenue = ticketsAgg[0]?.revenue || 0;
      const ticketsSold = ticketsAgg[0]?.sold || 0;

      res.json({ metrics: { eventsCount, organizersCount, ticketsSold, revenue } });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default new CampusController();
