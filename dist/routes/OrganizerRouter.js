"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OrganizerController_1 = __importDefault(require("../controllers/OrganizerController"));
const auth_1 = require("../middleware/auth");
class OrganizerRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.post("/campus/:campusId/organizers", auth_1.verifyToken, (0, auth_1.requireRole)(["campus", "super-admin"]), OrganizerController_1.default.create);
        this.router.get("/organizers", auth_1.verifyToken, (0, auth_1.requireRole)(["campus", "super-admin"]), OrganizerController_1.default.list);
        this.router.get("/organizers/:id", auth_1.verifyToken, OrganizerController_1.default.detail);
        this.router.put("/organizers/:id", auth_1.verifyToken, OrganizerController_1.default.update);
        this.router.delete("/organizers/:id", auth_1.verifyToken, (0, auth_1.requireRole)(["campus", "super-admin"]), OrganizerController_1.default.remove);
    }
}
exports.default = new OrganizerRouter().router;
