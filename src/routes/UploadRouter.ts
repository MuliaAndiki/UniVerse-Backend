import express from "express";
import UploadController from "../controllers/UploadController";
import upload from "../middleware/multer";
import { verifyToken } from "../middleware/auth";

class UploadRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }
  private routes() {
    this.router.post("/uploads", verifyToken, upload.single("file"), UploadController.upload);
  }
}

export default new UploadRouter().router;
