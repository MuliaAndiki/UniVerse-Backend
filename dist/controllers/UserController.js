"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("../models/Auth"));
class UserController {
    constructor() {
        this.getDetail = async (req, res) => {
            try {
                const { id } = req.params;
                const user = await Auth_1.default.findById(id);
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(user);
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const { profile, fullName, phoneNumber, fotoProfile } = req.body;
                const doc = await Auth_1.default.findByIdAndUpdate(id, { $set: { fullName, phoneNumber, fotoProfile, profile } }, { new: true });
                if (!doc) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.json(doc);
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        };
        this.remove = async (req, res) => {
            try {
                const { id } = req.params;
                const del = await Auth_1.default.findByIdAndDelete(id);
                if (!del) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.status(204).send();
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        };
        this.list = async (_req, res) => {
            try {
                const docs = await Auth_1.default.find();
                res.json({ data: docs, total: docs.length });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        };
    }
}
exports.default = new UserController();
