"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const midtrans_1 = __importDefault(require("../utils/midtrans"));
class PaymentService {
    static async chargeVA(params) {
        const core = (0, midtrans_1.default)();
        const payload = {
            payment_type: "bank_transfer",
            transaction_details: {
                order_id: params.order_id,
                gross_amount: params.gross_amount,
            },
            customer_details: params.customer_details,
            item_details: params.item_details,
            bank_transfer: { bank: "bca" },
        };
        const res = await core.charge(payload);
        return res;
    }
    static async chargeQRCode(params) {
        const core = (0, midtrans_1.default)();
        const payload = {
            payment_type: "gopay",
            transaction_details: {
                order_id: params.order_id,
                gross_amount: params.gross_amount,
            },
            gopay: { enable_callback: true, callback_url: "https://example.com/finish" },
        };
        const res = await core.charge(payload);
        return res;
    }
}
exports.PaymentService = PaymentService;
exports.default = PaymentService;
