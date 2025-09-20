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
        this.router();
    }
    router() {
        this.campusRouter.get("/", CampusController_1.default.sayHello);
    }
}
exports.default = new CampusRouter().campusRouter;
