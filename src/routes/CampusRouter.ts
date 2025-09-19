import express from "express";
import CampusController from "../controllers/CampusController";

class CampusRouter {
  public campusRouter;
  constructor() {
    this.campusRouter = express.Router();
    this.router();
  }

  private router() {
    this.campusRouter.get("/", CampusController.sayHello);
  }
}

export default new CampusRouter().campusRouter;
