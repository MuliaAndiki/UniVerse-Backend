import express from "express";
import TicketController from "../controllers/TicketController";
import { verifyToken, requireRole } from "../middleware/auth";

class TicketRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/events/:id/purchase", verifyToken, requireRole(["user"]), TicketController.purchase);
    this.router.get("/tickets/:id", verifyToken, TicketController.detail);
    this.router.get("/users/:id/tickets", verifyToken, TicketController.listByUser);
    this.router.post("/tickets/:id/verify", verifyToken, requireRole(["organizer", "campus"]), TicketController.verify);
    this.router.post("/tickets/:id/cancel", verifyToken, requireRole(["user"]), TicketController.cancel);
  }
}

export default new TicketRouter().router;
