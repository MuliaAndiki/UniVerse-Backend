"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
class UsersRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.get("/", UserController_1.default.list);
        this.router.get("/:id", UserController_1.default.getDetail);
        this.router.put("/:id", UserController_1.default.update);
        this.router.delete("/:id", UserController_1.default.remove);
    }
}
exports.default = new UsersRouter().router;
