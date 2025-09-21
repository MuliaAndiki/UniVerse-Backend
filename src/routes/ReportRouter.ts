import express from "express";
import ReportController from "../controllers/ReportController";

class ReportRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.get("/reports/super-admin", ReportController.superAdmin);
    this.router.get("/reports/campus/:campusId", ReportController.campus);
    this.router.get("/reports/organizer/:orgId", ReportController.organizer);
  }
}

export default new ReportRouter().router;
