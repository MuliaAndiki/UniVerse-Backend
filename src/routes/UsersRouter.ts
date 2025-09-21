import express from "express";
import UserController from "../controllers/UserController";
import { verifyToken, requireRole } from "../middleware/auth";

class UsersRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.get("/", verifyToken, requireRole(["super-admin"]), UserController.list);
    this.router.get("/:id", verifyToken, UserController.getDetail);
    this.router.put("/:id", verifyToken, UserController.update);
    this.router.delete("/:id", verifyToken, requireRole(["super-admin"]), UserController.remove);
  }
}

export default new UsersRouter().router;
