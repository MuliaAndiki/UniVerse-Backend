import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import Campus from "../models/Campus";

class OrganizerController {
  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { campusId } = req.params;
      const { userId, profile, approvedByCampus } = req.body;
      const campus = await Campus.findById(campusId);
      if (!campus) { res.status(404).json({ message: "Campus not found" }); return; }

      const organizer = await Organizer.create({
        userRef: userId,
        campusRef: campus._id,
        profile,
        approvedByCampus: !!approvedByCampus,
      });
      res.status(201).json(organizer);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
    }
  };

  public list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const { campusId } = _req.query as { campusId?: string };
      const q: any = {};
      if (campusId) q.campusRef = campusId;
      const docs = await Organizer.find(q).populate("userRef").populate("campusRef");
      res.json({ data: docs, total: docs.length });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
    }
  };

  public detail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const org = await Organizer.findById(id).populate("userRef").populate("campusRef");
      if (!org) { res.status(404).json({ message: "Organizer not found" }); return; }
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { profile, status, approvedByCampus } = req.body;
      const org = await Organizer.findByIdAndUpdate(
        id,
        { $set: { profile, status, approvedByCampus } },
        { new: true }
      );
      if (!org) { res.status(404).json({ message: "Organizer not found" }); return; }
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
    }
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const del = await Organizer.findByIdAndDelete(id);
      if (!del) { res.status(404).json({ message: "Organizer not found" }); return; }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: (error as Error).message });
    }
  };
}

export default new OrganizerController();

