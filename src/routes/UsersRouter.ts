import express from "express";
import UserController from "../controllers/UserController";

class UsersRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.get("/", UserController.list);
    this.router.get("/:id", UserController.getDetail);
    this.router.put("/:id", UserController.update);
    this.router.delete("/:id", UserController.remove);
  }
}

export default new UsersRouter().router;
