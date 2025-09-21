"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PaymentController_1 = __importDefault(require("../controllers/PaymentController"));
const auth_1 = require("../middleware/auth");
class PaymentRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.post("/payments/charge", auth_1.verifyToken, (0, auth_1.requireRole)(["user"]), PaymentController_1.default.charge);
        this.router.post("/webhooks/midtrans", PaymentController_1.default.webhookMidtrans);
        this.router.get("/payments/:orderId", auth_1.verifyToken, PaymentController_1.default.getPaymentStatus);
    }
}
exports.default = new PaymentRouter().router;
