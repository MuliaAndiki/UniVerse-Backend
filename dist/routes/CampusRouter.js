"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CampusController_1 = __importDefault(require("../controllers/CampusController"));
class CampusRouter {
    constructor() {
        this.campusRouter = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.campusRouter.post("/", CampusController_1.default.create);
        this.campusRouter.get("/", CampusController_1.default.list);
        this.campusRouter.get("/:id", CampusController_1.default.detail);
        this.campusRouter.put("/:id", CampusController_1.default.update);
        this.campusRouter.delete("/:id", CampusController_1.default.remove);
        this.campusRouter.get("/:id/reports", CampusController_1.default.reports);
    }
}
exports.default = new CampusRouter().campusRouter;
