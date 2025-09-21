"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TicketController_1 = __importDefault(require("../controllers/TicketController"));
class TicketRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.post("/events/:id/purchase", TicketController_1.default.purchase);
        this.router.get("/tickets/:id", TicketController_1.default.detail);
        this.router.get("/users/:id/tickets", TicketController_1.default.listByUser);
        this.router.post("/tickets/:id/verify", TicketController_1.default.verify);
        this.router.post("/tickets/:id/cancel", TicketController_1.default.cancel);
    }
}
exports.default = new TicketRouter().router;
