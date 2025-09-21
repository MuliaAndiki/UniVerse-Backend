import express from "express";
import CampusController from "../controllers/CampusController";
import { verifyToken, requireRole } from "../middleware/auth";

class CampusRouter {
  public campusRouter;
  constructor() {
    this.campusRouter = express.Router();
    this.router();
  }

  private router() {
    this.campusRouter.post(
      "/",
      verifyToken,
      requireRole(["super-admin"]),
      CampusController.create
    );
    this.campusRouter.get(
      "/",
      verifyToken,
      requireRole(["super-admin"]),
      CampusController.list
    );
    // fix
    // this.campusRouter.get("/:id", verifyToken, requireRole(["super-admin"]), CampusController.detail);
    // this.campusRouter.put("/:id", verifyToken, requireRole(["super-admin"]), CampusController.update);
    // this.campusRouter.delete("/:id", verifyToken, requireRole(["super-admin"]), CampusController.remove);
    // this.campusRouter.get(
    //   "/:id/reports",
    //   verifyToken,
    //   requireRole(["super-admin"]),
    //   CampusController.reports
    // );
  }
}

export default new CampusRouter().campusRouter;
