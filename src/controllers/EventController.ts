import { Request, Response } from "express";
import Event from "../models/Event";
import Organizer from "../models/Organizer";
import { getCalendarClient } from "../utils/googleCalendar";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class EventController {
  // Check
  public create = [
    verifyToken,
    requireRole(["organizer", "campus"]),
    warp(async (req: Request, res: Response) => {
      const { orgId } = req.params;
      const organizer = await Organizer.findById(orgId);
      if (!organizer) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Organizer not found",
          data: null,
          errors: null,
        });
      }

      const {
        title,
        description,
        category,
        location,
        startAt,
        endAt,
        capacity,
        price,
        images,
      } = req.body;

      const event = await Event.create({
        title,
        description,
        category,
        location,
        startAt,
        endAt,
        capacity,
        price,
        images: images || [],
        organizerRef: organizer._id,
        campusRef: organizer.campusRef,
        status: "draft",
      });

      // Optional: sync ke Google Calendar
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID as string;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
        const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI as string;
        const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN as
          | string
          | undefined;

        if (clientId && clientSecret && redirectUri && refreshToken) {
          const calendar = getCalendarClient({
            clientId,
            clientSecret,
            redirectUri,
            refreshToken,
          });
          const gcal = await calendar.events.insert({
            calendarId: "primary",
            requestBody: {
              summary: title,
              description,
              location,
              start: { dateTime: new Date(startAt).toISOString() },
              end: { dateTime: new Date(endAt).toISOString() },
            },
          });
          if (gcal.data.id) {
            event.googleCalendarId = gcal.data.id;
            await event.save();
          }
        }
      } catch (e) {
        console.warn("Google Calendar create failed:", (e as Error).message);
      }

      res.status(201).json({
        code: 201,
        status: "success",
        message: "Event created",
        data: event,
        errors: null,
      });
    }),
  ];

  public list = [
    warp(async (req: Request, res: Response) => {
      const {
        campus,
        category,
        startFrom,
        startTo,
        priceMin,
        priceMax,
        status,
        page = 1,
        limit = 20,
      } = req.query as any;

      const q: any = {};
      if (campus) q.campusRef = campus;
      if (category) q.category = category;
      if (status) q.status = status;
      if (startFrom || startTo) {
        q.startAt = {};
        if (startFrom) q.startAt.$gte = new Date(startFrom);
        if (startTo) q.startAt.$lte = new Date(startTo);
      }
      if (priceMin || priceMax) {
        q.price = {};
        if (priceMin) q.price.$gte = Number(priceMin);
        if (priceMax) q.price.$lte = Number(priceMax);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [data, totalData] = await Promise.all([
        Event.find(q)
          .skip(skip)
          .limit(Number(limit))
          .sort({ startAt: 1 })
          .populate("organizerRef")
          .populate("campusRef"),
        Event.countDocuments(q),
      ]);

      res.json({
        code: 200,
        status: "success",
        message: "Daftar event berhasil diambil",
        data,
        totalData,
        totalPages: Math.ceil(totalData / Number(limit)),
        errors: null,
      });
    }),
  ];

  public detail = [
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const doc = await Event.findById(id)
        .populate("organizerRef")
        .populate("campusRef");

      if (!doc) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Event not found",
          data: null,
          errors: null,
        });
      }

      res.json({
        code: 200,
        status: "success",
        message: "Detail event berhasil diambil",
        data: doc,
        errors: null,
      });
    }),
  ];

  public update = [
    verifyToken,
    requireRole(["organizer", "campus"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const doc = await Event.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );

      if (!doc) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Event not found",
          data: null,
          errors: null,
        });
      }

      res.json({
        code: 200,
        status: "success",
        message: "Event berhasil diupdate",
        data: doc,
        errors: null,
      });
    }),
  ];

  public remove = [
    verifyToken,
    requireRole(["organizer", "campus"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const del = await Event.findByIdAndDelete(id);
      if (!del) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Event not found",
          data: null,
          errors: null,
        });
      }
      res.json({
        code: 200,
        status: "success",
        message: "Event berhasil dihapus",
        data: del,
        errors: null,
      });
    }),
  ];

  public publish = [
    verifyToken,
    requireRole(["organizer", "campus"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const doc = await Event.findByIdAndUpdate(
        id,
        { $set: { status: "published" } },
        { new: true }
      );

      if (!doc) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Event not found",
          data: null,
          errors: null,
        });
      }

      res.json({
        code: 200,
        status: "success",
        message: "Event berhasil dipublish",
        data: doc,
        errors: null,
      });
    }),
  ];

  public cancel = [
    verifyToken,
    requireRole(["organizer", "campus"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const doc = await Event.findByIdAndUpdate(
        id,
        { $set: { status: "cancelled" } },
        { new: true }
      );

      if (!doc) {
        return res.status(404).json({
          code: 404,
          status: "error",
          message: "Event not found",
          data: null,
          errors: null,
        });
      }

      res.json({
        code: 200,
        status: "success",
        message: "Event berhasil dicancel",
        data: doc,
        errors: null,
      });
    }),
  ];
}

export default new EventController();
