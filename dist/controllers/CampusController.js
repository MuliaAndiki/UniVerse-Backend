"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Campus_1 = __importDefault(require("../models/Campus"));
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Event_1 = __importDefault(require("../models/Event"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
class CampusController {
    constructor() {
        this.create = async (req, res) => {
            try {
                const campus = await Campus_1.default.create(req.body);
                res.status(201).json(campus);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.list = async (_req, res) => {
            try {
                const docs = await Campus_1.default.find();
                res.json({ data: docs, total: docs.length });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.detail = async (req, res) => {
            try {
                const { id } = req.params;
                const doc = await Campus_1.default.findById(id);
                if (!doc)
                    return res.status(404).json({ message: "Campus not found" });
                res.json(doc);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const doc = await Campus_1.default.findByIdAndUpdate(id, { $set: req.body }, { new: true });
                if (!doc)
                    return res.status(404).json({ message: "Campus not found" });
                res.json(doc);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.remove = async (req, res) => {
            try {
                const { id } = req.params;
                const del = await Campus_1.default.findByIdAndDelete(id);
                if (!del)
                    return res.status(404).json({ message: "Campus not found" });
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
        this.reports = async (req, res) => {
            try {
                const { id } = req.params;
                const campus = await Campus_1.default.findById(id);
                if (!campus)
                    return res.status(404).json({ message: "Campus not found" });
                const [eventsCount, organizersCount, ticketsAgg] = await Promise.all([
                    Event_1.default.countDocuments({ campusRef: id }),
                    Organizer_1.default.countDocuments({ campusRef: id }),
                    Ticket_1.default.aggregate([
                        { $lookup: { from: "events", localField: "eventRef", foreignField: "_id", as: "e" } },
                        { $unwind: "$e" },
                        { $match: { "e.campusRef": campus._id, paymentStatus: "paid" } },
                        { $group: { _id: null, revenue: { $sum: "$pricePaid" }, sold: { $sum: 1 } } },
                    ]),
                ]);
                const revenue = ticketsAgg[0]?.revenue || 0;
                const ticketsSold = ticketsAgg[0]?.sold || 0;
                res.json({ metrics: { eventsCount, organizersCount, ticketsSold, revenue } });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        };
    }
}
exports.default = new CampusController();
