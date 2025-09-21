"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CampusController_1 = __importDefault(require("../controllers/CampusController"));
const auth_1 = require("../middleware/auth");
class CampusRouter {
    constructor() {
        this.campusRouter = express_1.default.Router();
        this.router();
    }
    router() {
        this.campusRouter.post("/", auth_1.verifyToken, (0, auth_1.requireRole)(["super-admin"]), CampusController_1.default.create);
        this.campusRouter.get("/", auth_1.verifyToken, (0, auth_1.requireRole)(["super-admin"]), CampusController_1.default.list);
        // fix
        // this.campusRouter.get("/:id", verifyToken, requireRole(["super-admin"]), CampusController.detail);
        // this.campusRouter.put("/:id", verifyToken, requireRole(["super-admin"]), CampusController.update);
        // this.campusRouter.delete("/:id", verifyToken, requireRole(["super-admin"]), CampusController.remove);
        // this.campusRouter.get(
        //   "/:id/reports",
        //   verifyToken,
        //   requireRole(["super-admin"]),
        //   CampusController.reports
        // );
    }
}
exports.default = new CampusRouter().campusRouter;
