"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UploadController_1 = __importDefault(require("../controllers/UploadController"));
const multer_1 = __importDefault(require("../middleware/multer"));
const auth_1 = require("../middleware/auth");
class UploadRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.post("/uploads", auth_1.verifyToken, multer_1.default.single("file"), UploadController_1.default.upload);
    }
}
exports.default = new UploadRouter().router;
