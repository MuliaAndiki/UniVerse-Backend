"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const googleCalendar_1 = require("../utils/googleCalendar");
const auth_1 = require("../middleware/auth");
const warp_1 = __importDefault(require("../utils/warp"));
class EventController {
    constructor() {
        // Check
        this.create = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus"]),
            (0, warp_1.default)(async (req, res) => {
                const { orgId } = req.params;
                const organizer = await Organizer_1.default.findById(orgId);
                if (!organizer) {
                    return res.status(404).json({
                        code: 404,
                        status: "error",
                        message: "Organizer not found",
                        data: null,
                        errors: null,
                    });
                }
                const { title, description, category, location, startAt, endAt, capacity, price, images, } = req.body;
                const event = await Event_1.default.create({
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
                    const clientId = process.env.GOOGLE_CLIENT_ID;
                    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
                    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
                    const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
                    if (clientId && clientSecret && redirectUri && refreshToken) {
                        const calendar = (0, googleCalendar_1.getCalendarClient)({
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
                }
                catch (e) {
                    console.warn("Google Calendar create failed:", e.message);
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
        this.list = [
            (0, warp_1.default)(async (req, res) => {
                const { campus, category, startFrom, startTo, priceMin, priceMax, status, page = 1, limit = 20, } = req.query;
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
                const [data, totalData] = await Promise.all([
                    Event_1.default.find(q)
                        .skip(skip)
                        .limit(Number(limit))
                        .sort({ startAt: 1 })
                        .populate("organizerRef")
                        .populate("campusRef"),
                    Event_1.default.countDocuments(q),
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
        this.detail = [
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const doc = await Event_1.default.findById(id)
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
        this.update = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const doc = await Event_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true });
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
        this.remove = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const del = await Event_1.default.findByIdAndDelete(id);
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
        this.publish = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const doc = await Event_1.default.findByIdAndUpdate(id, { $set: { status: "published" } }, { new: true });
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
        this.cancel = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const doc = await Event_1.default.findByIdAndUpdate(id, { $set: { status: "cancelled" } }, { new: true });
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
}
exports.default = new EventController();
