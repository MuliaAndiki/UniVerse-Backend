"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Campus_1 = __importDefault(require("../models/Campus"));
class OrganizerController {
    constructor() {
        this.create = async (req, res) => {
            try {
                const { campusId } = req.params;
                const { userId, profile, approvedByCampus } = req.body;
                const campus = await Campus_1.default.findById(campusId);
                if (!campus) {
                    res.status(404).json({ message: "Campus not found" });
                    return;
                }
                const organizer = await Organizer_1.default.create({
                    userRef: userId,
                    campusRef: campus._id,
                    profile,
                    approvedByCampus: !!approvedByCampus,
                });
                res.status(201).json(organizer);
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error", error: error.message });
            }
        };
        this.list = async (_req, res) => {
            try {
                const { campusId } = _req.query;
                const q = {};
                if (campusId)
                    q.campusRef = campusId;
                const docs = await Organizer_1.default.find(q).populate("userRef").populate("campusRef");
                res.json({ data: docs, total: docs.length });
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error", error: error.message });
            }
        };
        this.detail = async (req, res) => {
            try {
                const { id } = req.params;
                const org = await Organizer_1.default.findById(id).populate("userRef").populate("campusRef");
                if (!org) {
                    res.status(404).json({ message: "Organizer not found" });
                    return;
                }
                res.json(org);
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error", error: error.message });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const { profile, status, approvedByCampus } = req.body;
                const org = await Organizer_1.default.findByIdAndUpdate(id, { $set: { profile, status, approvedByCampus } }, { new: true });
                if (!org) {
                    res.status(404).json({ message: "Organizer not found" });
                    return;
                }
                res.json(org);
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error", error: error.message });
            }
        };
        this.remove = async (req, res) => {
            try {
                const { id } = req.params;
                const del = await Organizer_1.default.findByIdAndDelete(id);
                if (!del) {
                    res.status(404).json({ message: "Organizer not found" });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error", error: error.message });
            }
        };
    }
}
exports.default = new OrganizerController();
