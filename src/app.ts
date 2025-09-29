import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import nodeCron from "node-cron";
import authRouter from "./routes/AuthRouter";
import CampusRouter from "./routes/CampusRouter";
import UsersRouter from "./routes/UsersRouter";
import OrganizerRouter from "./routes/OrganizerRouter";
import EventRouter from "./routes/EventRouter";
import TicketRouter from "./routes/TicketRouter";
import PaymentRouter from "./routes/PaymentRouter";
import ReportRouter from "./routes/ReportRouter";
import AuthController from "./controllers/AuthController";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
    const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
    this.app.use("/api/auth", authLimiter, authRouter);
    this.app.use("/api/payments", paymentLimiter);
    this.app.use("/api/campus", CampusRouter);
    this.app.use("/api", UsersRouter);
    this.app.use("/api", OrganizerRouter);
    this.app.use("/api", EventRouter);
    this.app.use("/api", TicketRouter);
    this.app.use("/api", PaymentRouter);
    this.app.use("/api", ReportRouter);
  }

  private routes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "Hello World with TypeScript!",
        timestamp: new Date().toISOString(),
      });
    });
  }

  private runCron(): void {
    nodeCron.schedule("0 1 * * *", async () => {
      console.log("[CRON] Memulai pengecekan akun tidak verifikasi...");
      await AuthController.deleteAkun();
    });
  }
}
export default new App().app;
