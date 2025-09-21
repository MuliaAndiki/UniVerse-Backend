import express from "express";
import OrganizerController from "../controllers/OrganizerController";

class OrganizerRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post(
      "/campus/:campusId/organizers",
      OrganizerController.create
    );
    this.router.get("/organizers", OrganizerController.list);
    this.router.get("/organizers/:id", OrganizerController.detail);
    this.router.put("/organizers/:id", OrganizerController.update);
    this.router.delete("/organizers/:id", OrganizerController.remove);
  }
}

export default new OrganizerRouter().router;
