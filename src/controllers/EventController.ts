import { Request, Response } from "express";
import Event from "../models/Event";
import Organizer from "../models/Organizer";
import { getCalendarClient } from "../utils/googleCalendar";

class EventController {
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId } = req.params;
      const organizer = await Organizer.findById(orgId);
      if (!organizer) { res.status(404).json({ message: "Organizer not found" }); return; }

      const { title, description, category, location, startAt, endAt, capacity, price, images } = req.body;
      const event = await Event.create({
        title, description, category, location,
        startAt, endAt, capacity, price, images: images || [],
        organizerRef: organizer._id,
        campusRef: organizer.campusRef,
        status: "draft",
      });

      // Google Calendar (optional; uses global creds)
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID as string;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
        const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI as string;
        const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN as string | undefined;
        if (clientId && clientSecret && redirectUri && refreshToken) {
          const calendar = getCalendarClient({ clientId, clientSecret, redirectUri, refreshToken });
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
        // non-blocking
        console.warn("Google Calendar create failed:", (e as Error).message);
      }

      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { campus, category, startFrom, startTo, priceMin, priceMax, status, page = 1, limit = 20 } = req.query as any;
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
      const [data, total] = await Promise.all([
        Event.find(q).skip(skip).limit(Number(limit)).sort({ startAt: 1 }).populate("organizerRef").populate("campusRef"),
        Event.countDocuments(q),
      ]);
      res.json({ data, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public detail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doc = await Event.findById(id).populate("organizerRef").populate("campusRef");
      if (!doc) { res.status(404).json({ message: "Event not found" }); return; }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doc = await Event.findByIdAndUpdate(id, { $set: req.body }, { new: true });
      if (!doc) { res.status(404).json({ message: "Event not found" }); return; }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const del = await Event.findByIdAndDelete(id);
      if (!del) { res.status(404).json({ message: "Event not found" }); return; }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public publish = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doc = await Event.findByIdAndUpdate(id, { $set: { status: "published" } }, { new: true });
      if (!doc) { res.status(404).json({ message: "Event not found" }); return; }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  public cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doc = await Event.findByIdAndUpdate(id, { $set: { status: "cancelled" } }, { new: true });
      if (!doc) { res.status(404).json({ message: "Event not found" }); return; }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}

export default new EventController();
