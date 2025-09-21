import express from "express";
import TicketController from "../controllers/TicketController";

class TicketRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/events/:id/purchase", TicketController.purchase);
    this.router.get("/tickets/:id", TicketController.detail);
    this.router.get("/users/:id/tickets", TicketController.listByUser);
    this.router.post("/tickets/:id/verify", TicketController.verify);
    this.router.post("/tickets/:id/cancel", TicketController.cancel);
  }
}

export default new TicketRouter().router;
