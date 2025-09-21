import express from "express";
import CampusController from "../controllers/CampusController";

class CampusRouter {
  public campusRouter;

  constructor() {
    this.campusRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.campusRouter.post("/", CampusController.create);
    this.campusRouter.get("/", CampusController.list);
    this.campusRouter.get("/:id", CampusController.detail);
    this.campusRouter.put("/:id", CampusController.update);
    this.campusRouter.delete("/:id", CampusController.remove);
    this.campusRouter.get("/:id/reports", CampusController.reports);
  }
}

export default new CampusRouter().campusRouter;
