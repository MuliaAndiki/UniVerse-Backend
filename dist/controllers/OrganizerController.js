"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Organizer_1 = __importDefault(require("../models/Organizer"));
const Campus_1 = __importDefault(require("../models/Campus"));
const auth_1 = require("../middleware/auth");
const warp_1 = __importDefault(require("../utils/warp"));
class OrganizerController {
    constructor() {
        this.create = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["campus", "super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { campusId } = req.params;
                const { userId, profile, approvedByCampus } = req.body;
                const campus = await Campus_1.default.findById(campusId);
                if (!campus) {
                    return res.status(404).json({
                        code: 404,
                        status: "error",
                        message: "Campus not found",
                        data: null,
                        errors: null,
                    });
                }
                const organizer = await Organizer_1.default.create({
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
        this.list = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["campus", "super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { campusId } = req.query;
                const q = {};
                if (campusId)
                    q.campusRef = campusId;
                const docs = await Organizer_1.default.find(q)
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
        this.detail = [
            auth_1.verifyToken,
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const org = await Organizer_1.default.findById(id)
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
        this.update = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["campus", "super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const { profile, status, approvedByCampus } = req.body;
                const org = await Organizer_1.default.findByIdAndUpdate(id, { $set: { profile, status, approvedByCampus } }, { new: true });
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
        this.remove = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["campus", "super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const del = await Organizer_1.default.findByIdAndDelete(id);
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
}
exports.default = new OrganizerController();
