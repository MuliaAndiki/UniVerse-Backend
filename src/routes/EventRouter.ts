import express from "express";
import EventController from "../controllers/EventController";

class EventRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/organizers/:orgId/events", EventController.create);
    this.router.get("/events", EventController.list);
    this.router.get("/events/:id", EventController.detail);
    this.router.put("/events/:id", EventController.update);
    this.router.delete("/events/:id", EventController.remove);
    this.router.post("/events/:id/publish", EventController.publish);
    this.router.post("/events/:id/cancel", EventController.cancel);
  }
}

export default new EventRouter().router;
