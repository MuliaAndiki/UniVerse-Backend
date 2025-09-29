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
class CampusController {
    constructor() {
        // Fix
        this.create = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const campus = await Campus_1.default.create(req.body);
                res.status(201).json({
                    code: 201,
                    status: "success",
                    message: "Campus berhasil dibuat",
                    data: campus,
                    errors: null,
                });
            }),
        ];
        this.list = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (_req, res) => {
                const docs = await Campus_1.default.find();
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
        this.detail = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const doc = await Campus_1.default.findById(id);
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
        this.update = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const doc = await Campus_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true });
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
        this.remove = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const del = await Campus_1.default.findByIdAndDelete(id);
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
        this.reports = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const campus = await Campus_1.default.findById(id);
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
                    Event_1.default.countDocuments({ campusRef: id }),
                    Organizer_1.default.countDocuments({ campusRef: id }),
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
}
exports.default = new CampusController();
