"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const auth_1 = require("../middleware/auth");
class UsersRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.get("/", auth_1.verifyToken, (0, auth_1.requireRole)(["super-admin"]), UserController_1.default.list);
        this.router.get("/:id", auth_1.verifyToken, UserController_1.default.getDetail);
        this.router.put("/:id", auth_1.verifyToken, UserController_1.default.update);
        this.router.delete("/:id", auth_1.verifyToken, (0, auth_1.requireRole)(["super-admin"]), UserController_1.default.remove);
    }
}
exports.default = new UsersRouter().router;
