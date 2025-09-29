"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
class QRCodeService {
    static async generate(data) {
        const buffer = await qrcode_1.default.toBuffer(data, {
            type: "png",
            errorCorrectionLevel: "H",
        });
        return buffer;
    }
}
exports.QRCodeService = QRCodeService;
exports.default = QRCodeService;
