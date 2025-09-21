import { Request, Response } from "express";
import Auth from "../models/Auth";

class UserController {
  public getDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await Auth.findById(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const del = await Auth.findByIdAndDelete(id);
      if (!del) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  public list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const docs = await Auth.find();
      res.json({ data: docs, total: docs.length });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}

export default new UserController();
