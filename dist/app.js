"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const AuthRouter_1 = __importDefault(require("./routes/AuthRouter"));
const node_cron_1 = __importDefault(require("node-cron"));
const AuthController_1 = __importDefault(require("./controllers/AuthController"));
const CampusRouter_1 = __importDefault(require("./routes/CampusRouter"));
const UsersRouter_1 = __importDefault(require("./routes/UsersRouter"));
const OrganizerRouter_1 = __importDefault(require("./routes/OrganizerRouter"));
const EventRouter_1 = __importDefault(require("./routes/EventRouter"));
const TicketRouter_1 = __importDefault(require("./routes/TicketRouter"));
const PaymentRouter_1 = __importDefault(require("./routes/PaymentRouter"));
const ReportRouter_1 = __importDefault(require("./routes/ReportRouter"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.middlewares();
        this.routes();
        this.runCron();
    }
    middlewares() {
        this.app.use((0, cors_1.default)({ origin: "*", optionsSuccessStatus: 200 }));
        this.app.use((0, helmet_1.default)());
        this.app.use((0, express_mongo_sanitize_1.default)());
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(body_parser_1.default.json());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Rate limiting for auth & payments
        const authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
        const paymentLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 200 });
        this.app.use("/api/auth", authLimiter, AuthRouter_1.default);
        this.app.use("/api/payments", paymentLimiter);
        // Routers
        this.app.use("/api/campus", CampusRouter_1.default);
        this.app.use("/api", UsersRouter_1.default);
        this.app.use("/api", OrganizerRouter_1.default);
        this.app.use("/api", EventRouter_1.default);
        this.app.use("/api", TicketRouter_1.default);
        this.app.use("/api", PaymentRouter_1.default);
        this.app.use("/api", ReportRouter_1.default);
    }
    routes() {
        this.app.get("/", (req, res) => {
            res.json({
                message: "Hello World with TypeScript!",
                timestamp: new Date().toISOString(),
            });
        });
    }
    runCron() {
        node_cron_1.default.schedule("0 1 * * *", async () => {
            console.log("[CRON] Memulai pengecekan akun tidak verifikasi...");
            await AuthController_1.default.deleteAkun();
        });
    }
}
exports.default = new App().app;
