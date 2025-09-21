"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Campus_1 = __importDefault(require("../models/Campus"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Event_1 = __importDefault(require("../models/Event"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const auth_1 = require("../middleware/auth");
const warp_1 = __importDefault(require("../utils/warp"));
class ReportController {
    constructor() {
        this.superAdmin = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (_req, res) => {
                const [campusCount, organizers, events, tickets] = await Promise.all([
                    Campus_1.default.countDocuments({}),
                    Organizer_1.default.aggregate([
                        { $group: { _id: "$campusRef", count: { $sum: 1 } } },
                    ]),
                    Event_1.default.aggregate([
                        { $group: { _id: "$campusRef", count: { $sum: 1 } } },
                    ]),
                    Ticket_1.default.aggregate([
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
        this.campus = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["campus", "super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { campusId } = req.params;
                const [organizersCount, eventsCount, ticketsAgg] = await Promise.all([
                    Organizer_1.default.countDocuments({ campusRef: campusId }),
                    Event_1.default.countDocuments({ campusRef: campusId }),
                    Ticket_1.default.aggregate([
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
                                "e.campusRef": req.params.campusId,
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
        this.organizer = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["organizer", "campus", "super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { orgId } = req.params;
                const [eventsCount, ticketsAgg] = await Promise.all([
                    Event_1.default.countDocuments({ organizerRef: orgId }),
                    Ticket_1.default.aggregate([
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
                                "e.organizerRef": req.params.orgId,
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
}
exports.default = new ReportController();
