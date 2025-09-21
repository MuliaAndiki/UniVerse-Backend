import { Request, Response } from "express";
import Auth from "../models/Auth";
import { verifyToken, requireRole } from "../middleware/auth";
import warp from "../utils/warp";

class UserController {
  public list = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (_req: Request, res: Response) => {
      const docs = await Auth.find();
      res.json({ data: docs, total: docs.length });
    }),
  ];

  public getDetail = [
    verifyToken,
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const user = await Auth.findById(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    }),
  ];

  public update = [
    verifyToken,
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const { profile, fullName, phoneNumber, fotoProfile } = req.body;

      const doc = await Auth.findByIdAndUpdate(
        id,
        { $set: { fullName, phoneNumber, fotoProfile, profile } },
        { new: true }
      );

      if (!doc) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(doc);
    }),
  ];

  public remove = [
    verifyToken,
    requireRole(["super-admin"]),
    warp(async (req: Request, res: Response) => {
      const { id } = req.params;
      const del = await Auth.findByIdAndDelete(id);
      if (!del) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(204).send();
    }),
  ];
}

export default new UserController();
