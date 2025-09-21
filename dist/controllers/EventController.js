"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const googleCalendar_1 = require("../utils/googleCalendar");
class EventController {
    constructor() {
        this.create = async (req, res) => {
            try {
                const { orgId } = req.params;
                const organizer = await Organizer_1.default.findById(orgId);
                if (!organizer) {
                    res.status(404).json({ message: "Organizer not found" });
                    return;
                }
                const { title, description, category, location, startAt, endAt, capacity, price, images } = req.body;
                const event = await Event_1.default.create({
                    title, description, category, location,
                    startAt, endAt, capacity, price, images: images || [],
                    organizerRef: organizer._id,
                    campusRef: organizer.campusRef,
                    status: "draft",
                });
                // Google Calendar (optional; uses global creds)
                try {
                    const clientId = process.env.GOOGLE_CLIENT_ID;
                    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
                    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
                    const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
                    if (clientId && clientSecret && redirectUri && refreshToken) {
                        const calendar = (0, googleCalendar_1.getCalendarClient)({ clientId, clientSecret, redirectUri, refreshToken });
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
                }
                catch (e) {
                    // non-blocking
                    console.warn("Google Calendar create failed:", e.message);
                }
                res.status(201).json(event);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.list = async (req, res) => {
            try {
                const { campus, category, startFrom, startTo, priceMin, priceMax, status, page = 1, limit = 20 } = req.query;
                const q = {};
                if (campus)
                    q.campusRef = campus;
                if (category)
                    q.category = category;
                if (status)
                    q.status = status;
                if (startFrom || startTo) {
                    q.startAt = {};
                    if (startFrom)
                        q.startAt.$gte = new Date(startFrom);
                    if (startTo)
                        q.startAt.$lte = new Date(startTo);
                }
                if (priceMin || priceMax) {
                    q.price = {};
                    if (priceMin)
                        q.price.$gte = Number(priceMin);
                    if (priceMax)
                        q.price.$lte = Number(priceMax);
                }
                const skip = (Number(page) - 1) * Number(limit);
                const [data, total] = await Promise.all([
                    Event_1.default.find(q).skip(skip).limit(Number(limit)).sort({ startAt: 1 }).populate("organizerRef").populate("campusRef"),
                    Event_1.default.countDocuments(q),
                ]);
                res.json({ data, total, page: Number(page), limit: Number(limit) });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.detail = async (req, res) => {
            try {
                const { id } = req.params;
                const doc = await Event_1.default.findById(id).populate("organizerRef").populate("campusRef");
                if (!doc) {
                    res.status(404).json({ message: "Event not found" });
                    return;
                }
                res.json(doc);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const doc = await Event_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true });
                if (!doc) {
                    res.status(404).json({ message: "Event not found" });
                    return;
                }
                res.json(doc);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.remove = async (req, res) => {
            try {
                const { id } = req.params;
                const del = await Event_1.default.findByIdAndDelete(id);
                if (!del) {
                    res.status(404).json({ message: "Event not found" });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.publish = async (req, res) => {
            try {
                const { id } = req.params;
                const doc = await Event_1.default.findByIdAndUpdate(id, { $set: { status: "published" } }, { new: true });
                if (!doc) {
                    res.status(404).json({ message: "Event not found" });
                    return;
                }
                res.json(doc);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.cancel = async (req, res) => {
            try {
                const { id } = req.params;
                const doc = await Event_1.default.findByIdAndUpdate(id, { $set: { status: "cancelled" } }, { new: true });
                if (!doc) {
                    res.status(404).json({ message: "Event not found" });
                    return;
                }
                res.json(doc);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
    }
}
exports.default = new EventController();
