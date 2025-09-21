import express from "express";
import ReportController from "../controllers/ReportController";
import { verifyToken, requireRole } from "../middleware/auth";

class ReportRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.get("/reports/super-admin", verifyToken, requireRole(["super-admin"]), ReportController.superAdmin);
    this.router.get("/reports/campus/:campusId", verifyToken, requireRole(["campus", "super-admin"]), ReportController.campus);
    this.router.get("/reports/organizer/:orgId", verifyToken, requireRole(["organizer", "campus", "super-admin"]), ReportController.organizer);
  }
}

export default new ReportRouter().router;
