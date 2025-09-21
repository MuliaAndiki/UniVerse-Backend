"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMidtransClient = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
let core = null;
const getMidtransClient = () => {
    if (!core) {
        core = new midtrans_client_1.default.CoreApi({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });
    }
    return core;
};
exports.getMidtransClient = getMidtransClient;
exports.default = exports.getMidtransClient;
