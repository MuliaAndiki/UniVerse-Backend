import { Request, Response } from "express";
import Campus from "../models/Campus";
import Organizer from "../models/Organizer";
import Event from "../models/Event";
import Ticket from "../models/Ticket";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class ReportController {
  public superAdmin = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (_req: Request, res: Response) => {
      const [campusCount, organizers, events, tickets] = await Promise.all([
        Campus.countDocuments({}),
        Organizer.aggregate([
          { $group: { _id: "$campusRef", count: { $sum: 1 } } },
        ]),
        Event.aggregate([
          { $group: { _id: "$campusRef", count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $match: { paymentStatus: "paid" } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$pricePaid" },
              sold: { $sum: 1 },
            },
          },
        ]),
      ]);

      const revenue = tickets[0]?.revenue || 0;
      const sold = tickets[0]?.sold || 0;

      res.json({
        metrics: { campusCount, revenue, ticketsSold: sold },
        organizersByCampus: organizers,
        eventsByCampus: events,
      });
    }),
  ];

  public campus = [
    verifyToken,
    requireRole(["campus", "super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { campusId } = req.params;
      const [organizersCount, eventsCount, ticketsAgg] = await Promise.all([
        Organizer.countDocuments({ campusRef: campusId }),
        Event.countDocuments({ campusRef: campusId }),
        Ticket.aggregate([
          {
            $lookup: {
              from: "events",
              localField: "eventRef",
              foreignField: "_id",
              as: "e",
            },
          },
          { $unwind: "$e" },
          {
            $match: {
              "e.campusRef": (req.params as any).campusId,
              paymentStatus: "paid",
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$pricePaid" },
              sold: { $sum: 1 },
            },
          },
        ]),
      ]);

      const revenue = ticketsAgg[0]?.revenue || 0;
      const ticketsSold = ticketsAgg[0]?.sold || 0;

      res.json({
        metrics: { organizersCount, eventsCount, ticketsSold, revenue },
      });
    }),
  ];

  public organizer = [
    verifyToken,
    requireRole(["organizer", "campus", "super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { orgId } = req.params;
      const [eventsCount, ticketsAgg] = await Promise.all([
        Event.countDocuments({ organizerRef: orgId }),
        Ticket.aggregate([
          {
            $lookup: {
              from: "events",
              localField: "eventRef",
              foreignField: "_id",
              as: "e",
            },
          },
          { $unwind: "$e" },
          {
            $match: {
              "e.organizerRef": (req.params as any).orgId,
              paymentStatus: "paid",
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$pricePaid" },
              sold: { $sum: 1 },
            },
          },
        ]),
      ]);

      const revenue = ticketsAgg[0]?.revenue || 0;
      const ticketsSold = ticketsAgg[0]?.sold || 0;

      res.json({ metrics: { eventsCount, ticketsSold, revenue } });
    }),
  ];
}

export default new ReportController();
