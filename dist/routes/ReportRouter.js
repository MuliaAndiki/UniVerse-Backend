"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ReportController_1 = __importDefault(require("../controllers/ReportController"));
class ReportRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.get("/reports/super-admin", ReportController_1.default.superAdmin);
        this.router.get("/reports/campus/:campusId", ReportController_1.default.campus);
        this.router.get("/reports/organizer/:orgId", ReportController_1.default.organizer);
    }
}
exports.default = new ReportRouter().router;
