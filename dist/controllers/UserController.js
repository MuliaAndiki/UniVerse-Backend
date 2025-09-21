"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("../models/Auth"));
const auth_1 = require("../middleware/auth");
const warp_1 = __importDefault(require("../utils/warp"));
class UserController {
    constructor() {
        this.list = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (_req, res) => {
                const docs = await Auth_1.default.find();
                res.json({ data: docs, total: docs.length });
            }),
        ];
        this.getDetail = [
            auth_1.verifyToken,
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const user = await Auth_1.default.findById(id);
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(user);
            }),
        ];
        this.update = [
            auth_1.verifyToken,
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const { profile, fullName, phoneNumber, fotoProfile } = req.body;
                const doc = await Auth_1.default.findByIdAndUpdate(id, { $set: { fullName, phoneNumber, fotoProfile, profile } }, { new: true });
                if (!doc) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(doc);
            }),
        ];
        this.remove = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["super-admin"]),
            (0, warp_1.default)(async (req, res) => {
                const { id } = req.params;
                const del = await Auth_1.default.findByIdAndDelete(id);
                if (!del) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.status(204).send();
            }),
        ];
    }
}
exports.default = new UserController();
