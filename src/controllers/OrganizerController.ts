import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import Campus from "../models/Campus";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class OrganizerController {
  public create = [
    verifyToken,
    requireRole(["campus", "super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { campusId } = req.params;
      const { userId, profile, approvedByCampus } = req.body;
      const campus = await Campus.findById(campusId);
      if (!campus) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Campus not found",
          data: null,
          errors: null,
        });
      }

      const organizer = await Organizer.create({
        userRef: userId,
        campusRef: campus._id,
        profile,
        approvedByCampus: !!approvedByCampus,
      });

      res.status(201).json({
        code: 201,
        status: "success",
        message: "Organizer created",
        data: organizer,
        errors: null,
      });
    }),
  ];

  public list = [
    verifyToken,
    requireRole(["campus", "super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { campusId } = req.query as { campusId?: string };
      const q: any = {};
      if (campusId) q.campusRef = campusId;

      const docs = await Organizer.find(q)
        .populate("userRef")
        .populate("campusRef");

      res.json({
        code: 200,
        status: "success",
        message: "Organizer list fetched",
        data: docs,
        errors: null,
      });
    }),
  ];

  public detail = [
    verifyToken,
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const org = await Organizer.findById(id)
        .populate("userRef")
        .populate("campusRef");

      if (!org) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Organizer not found",
          data: null,
          errors: null,
        });
      }

      res.json({
        code: 200,
        status: "success",
        message: "Organizer detail fetched",
        data: org,
        errors: null,
      });
    }),
  ];

  public update = [
    verifyToken,
    requireRole(["campus", "super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const { profile, status, approvedByCampus } = req.body;

      const org = await Organizer.findByIdAndUpdate(
        id,
        { $set: { profile, status, approvedByCampus } },
        { new: true }
      );

      if (!org) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Organizer not found",
          data: null,
          errors: null,
        });
      }

      res.json({
        code: 200,
        status: "success",
        message: "Organizer updated",
        data: org,
        errors: null,
      });
    }),
  ];

  public remove = [
    verifyToken,
    requireRole(["campus", "super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const del = await Organizer.findByIdAndDelete(id);

      if (!del) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Organizer not found",
          data: null,
          errors: null,
        });
      }

      res.status(200).json({
        code: 200,
        status: "success",
        message: "Organizer removed",
        data: null,
        errors: null,
      });
    }),
  ];
}

export default new OrganizerController();
