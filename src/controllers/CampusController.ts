import { Request, Response } from "express";
import Campus from "../models/Campus";
import Organizer from "../models/Organizer";
import Event from "../models/Event";
import Ticket from "../models/Ticket";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class CampusController {
  public create = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (req: Request, res: Response) => {
      const campus = await Campus.create(req.body);
      res.status(201).json({
        code: 201,
        status: "success",
        message: "Campus berhasil dibuat",
        data: campus,
        errors: null,
      });
    }),
  ];

  public list = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (_req: Request, res: Response) => {
      const docs = await Campus.find();
      res.json({
        code: 200,
        status: "success",
        message: "Daftar campus berhasil diambil",
        data: docs,
        totalData: docs.length,
        totalPages: 1,
        errors: null,
      });
    }),
  ];

  public detail = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const doc = await Campus.findById(id);
      if (!doc) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Campus not found",
          data: null,
          errors: null,
        });
      }
      res.json({
        code: 200,
        status: "success",
        message: "Detail campus berhasil diambil",
        data: doc,
        errors: null,
      });
    }),
  ];

  public update = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const doc = await Campus.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!doc) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Campus not found",
          data: null,
          errors: null,
        });
      }
      res.json({
        code: 200,
        status: "success",
        message: "Campus berhasil diupdate",
        data: doc,
        errors: null,
      });
    }),
  ];

  public remove = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const del = await Campus.findByIdAndDelete(id);
      if (!del) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Campus not found",
          data: null,
          errors: null,
        });
      }
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Campus berhasil dihapus",
        data: del,
        errors: null,
      });
    }),
  ];

  public reports = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const campus = await Campus.findById(id);
      if (!campus) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Campus not found",
          data: null,
          errors: null,
        });
      }

      const [eventsCount, organizersCount, ticketsAgg] = await Promise.all([
        Event.countDocuments({ campusRef: id }),
        Organizer.countDocuments({ campusRef: id }),
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
              "e.campusRef": campus._id,
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
        code: 200,
        status: "success",
        message: "Laporan campus berhasil diambil",
        data: {
          metrics: { eventsCount, organizersCount, ticketsSold, revenue },
        },
        errors: null,
      });
    }),
  ];
}

export default new CampusController();
