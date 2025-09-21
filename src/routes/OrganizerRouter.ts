import express from "express";
import OrganizerController from "../controllers/OrganizerController";
import { verifyToken, requireRole } from "../middleware/auth";

class OrganizerRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/campus/:campusId/organizers", verifyToken, requireRole(["campus", "super-admin"]), OrganizerController.create);
    this.router.get("/organizers", verifyToken, requireRole(["campus", "super-admin"]), OrganizerController.list);
    this.router.get("/organizers/:id", verifyToken, OrganizerController.detail);
    this.router.put("/organizers/:id", verifyToken, OrganizerController.update);
    this.router.delete("/organizers/:id", verifyToken, requireRole(["campus", "super-admin"]), OrganizerController.remove);
  }
}

export default new OrganizerRouter().router;
