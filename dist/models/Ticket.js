"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ticketSchema = new mongoose_1.Schema({
    ticketId: { type: String, required: true, unique: true },
    eventRef: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event", required: true },
    buyerRef: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    pricePaid: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "expired", "cancelled"],
        default: "pending",
    },
    midtransOrderId: { type: String, required: true, unique: true },
    qrUrl: { type: String },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
}, { timestamps: true });
exports.Ticket = mongoose_1.default.models.Ticket || mongoose_1.default.model("Ticket", ticketSchema);
exports.default = exports.Ticket;
