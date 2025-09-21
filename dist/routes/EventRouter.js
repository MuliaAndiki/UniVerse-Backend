"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EventController_1 = __importDefault(require("../controllers/EventController"));
const auth_1 = require("../middleware/auth");
class EventRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.post("/organizers/:orgId/events", auth_1.verifyToken, (0, auth_1.requireRole)(["organizer", "campus"]), EventController_1.default.create);
        this.router.get("/events", EventController_1.default.list);
        this.router.get("/events/:id", EventController_1.default.detail);
        this.router.put("/events/:id", auth_1.verifyToken, (0, auth_1.requireRole)(["organizer", "campus"]), EventController_1.default.update);
        this.router.delete("/events/:id", auth_1.verifyToken, (0, auth_1.requireRole)(["organizer", "campus"]), EventController_1.default.remove);
        this.router.post("/events/:id/publish", auth_1.verifyToken, (0, auth_1.requireRole)(["organizer", "campus"]), EventController_1.default.publish);
        this.router.post("/events/:id/cancel", auth_1.verifyToken, (0, auth_1.requireRole)(["organizer", "campus"]), EventController_1.default.cancel);
    }
}
exports.default = new EventRouter().router;
