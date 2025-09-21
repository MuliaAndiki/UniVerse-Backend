import express from "express";
import EventController from "../controllers/EventController";
import { verifyToken, requireRole } from "../middleware/auth";

class EventRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/organizers/:orgId/events", verifyToken, requireRole(["organizer", "campus"]), EventController.create);
    this.router.get("/events", EventController.list);
    this.router.get("/events/:id", EventController.detail);
    this.router.put("/events/:id", verifyToken, requireRole(["organizer", "campus"]), EventController.update);
    this.router.delete("/events/:id", verifyToken, requireRole(["organizer", "campus"]), EventController.remove);
    this.router.post("/events/:id/publish", verifyToken, requireRole(["organizer", "campus"]), EventController.publish);
    this.router.post("/events/:id/cancel", verifyToken, requireRole(["organizer", "campus"]), EventController.cancel);
  }
}

export default new EventRouter().router;
